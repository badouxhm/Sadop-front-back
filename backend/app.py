# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
import os
import sys
from datetime import datetime
from utils import transcribe_audio
import io

# Forcer l'encodage UTF-8 pour Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app)

# Configuration de la base de données MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://{}:{}@{}/{}'.format(
    os.getenv('DB_USER', 'root'),
    os.getenv('DB_PASSWORD', ''),
    os.getenv('DB_HOST', 'localhost'),
    os.getenv('DB_NAME', 'sadop')
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max pour les fichiers SQL

db = SQLAlchemy(app)

# ==================== MODÈLES ====================

class Conversation(db.Model):
    """Table pour les conversations/discussions"""
    __tablename__ = 'conversations'
    
    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(255), nullable=False, default="Nouvelle Discussion")
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_modification = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'titre': self.titre,
            'date_creation': self.date_creation.isoformat(),
            'date_modification': self.date_modification.isoformat()
        }


class BDD(db.Model):
    """Table pour enregistrer les fichiers SQL uploadés"""
    __tablename__ = 'bdd'
    
    id = db.Column(db.Integer, primary_key=True)
    nom_fichier = db.Column(db.String(255), nullable=False)
    contenu = db.Column(db.Text, nullable=True)  # Contenu du fichier SQL
    date_upload = db.Column(db.DateTime, default=datetime.utcnow)
    taille = db.Column(db.Integer)  # Taille en bytes
    
    def to_dict(self):
        return {
            'id': self.id,
            'nom_fichier': self.nom_fichier,
            'contenu': self.contenu,
            'date_upload': self.date_upload.isoformat(),
            'taille': self.taille
        }


class Message(db.Model):
    """Table pour stocker les messages"""
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    contenu = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50))  # 'user', 'ai', 'system'
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'contenu': self.contenu,
            'type': self.type,
            'date_creation': self.date_creation.isoformat()
        }


# ==================== ROUTES ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérification de l'état du serveur"""
    return jsonify({'status': 'ok', 'message': 'Backend Flask is running'}), 200


@app.route('/api/upload-sql', methods=['POST'])
def upload_sql():
    """
    Upload un fichier SQL et l'enregistre dans la base MySQL (sans l'exécuter)
    """
    try:
        print("[DEBUG] Requete upload-sql recue")
        
        if 'file' not in request.files:
            print("[ERROR] Aucun fichier dans la requete")
            return jsonify({'error': 'Aucun fichier fourni'}), 400
        
        file = request.files['file']
        print(f"[DEBUG] Fichier recu: {file.filename}")
        
        if file.filename == '':
            return jsonify({'error': 'Nom de fichier vide'}), 400
        
        if not file.filename.endswith('.sql'):
            return jsonify({'error': 'Le fichier doit être un fichier SQL'}), 400
        
        # Lire le contenu du fichier SQL
        sql_content = file.read().decode('utf-8')
        file_size = len(sql_content.encode('utf-8'))
        print(f"[DEBUG] Taille du fichier: {file_size} bytes")
        
        # Enregistrer le fichier dans la table bdd (SANS l'exécuter)
        try:
            nouveau_fichier = BDD(
                nom_fichier=file.filename,
                contenu=sql_content,
                taille=file_size
            )
            db.session.add(nouveau_fichier)
            db.session.commit()
            
            print(f"[SUCCESS] Fichier enregistre dans la table bdd avec ID: {nouveau_fichier.id}")
            
            return jsonify({
                'success': True,
                'message': f'Fichier {file.filename} enregistré dans la BDD',
                'fichier': nouveau_fichier.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            print(f"[ERROR] Erreur enregistrement: {str(e)}")
            return jsonify({'error': f'Erreur lors de l\'enregistrement: {str(e)}'}), 500
    
    except Exception as e:
        print(f"[ERROR] Erreur upload: {str(e)}")
        return jsonify({'error': f'Erreur lors de l\'upload: {str(e)}'}), 500


@app.route('/api/message', methods=['POST'])
def send_message():
    """
    API pour envoyer des messages texte à l'IA
    Accepte du texte directement ou de l'audio (qui sera transcrit)
    Requiert: conversation_id
    """
    try:
        # Récupérer l'ID de la conversation
        conversation_id = None
        message_text = None
        user_type = 'user'
        
        # Cas 1: Message texte
        if request.is_json:
            data = request.get_json()
            
            if 'message' not in data:
                return jsonify({'error': 'Le champ "message" est requis'}), 400
            
            if 'conversation_id' not in data:
                return jsonify({'error': 'Le champ "conversation_id" est requis'}), 400
            
            message_text = data['message']
            conversation_id = data['conversation_id']
            user_type = data.get('type', 'user')
            
        # Cas 2: Audio à transcrire
        elif 'audio' in request.files:
            audio_file = request.files['audio']
            
            # Récupérer conversation_id du formulaire
            conversation_id = request.form.get('conversation_id')
            if not conversation_id:
                return jsonify({'error': 'Le champ "conversation_id" est requis'}), 400
            
            try:
                conversation_id = int(conversation_id)
            except ValueError:
                return jsonify({'error': 'conversation_id doit être un nombre'}), 400
            
            # Lire le fichier audio en mémoire
            audio_buffer = io.BytesIO()
            audio_file.save(audio_buffer)
            audio_buffer.seek(0)
            
            # Transcrire l'audio
            try:
                message_text = transcribe_audio(audio_buffer)
            except Exception as e:
                return jsonify({'error': f'Erreur lors de la transcription: {str(e)}'}), 500
            
            user_type = 'user'
        
        else:
            return jsonify({'error': 'Format de requête invalide. Envoyez du JSON avec "message" ou un fichier "audio"'}), 400
        
        # Vérifier que la conversation existe
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return jsonify({'error': f'Conversation {conversation_id} introuvable'}), 404
        
        # Sauvegarder le message dans la base de données
        nouveau_message = Message(
            conversation_id=conversation_id,
            contenu=message_text,
            type=user_type
        )
        db.session.add(nouveau_message)
        db.session.commit()
        
        # TODO: Ici, transmettre le message à la partie IA
        # Pour l'instant, on retourne juste le message reçu
        
        return jsonify({
            'success': True,
            'message': 'Message reçu',
            'data': {
                'id': nouveau_message.id,
                'contenu': message_text,
                'type': user_type,
                'date_creation': nouveau_message.date_creation.isoformat()
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500


@app.route('/api/messages', methods=['GET'])
def get_messages():
    """
    Récupérer l'historique des messages (optionnel: filtrer par conversation_id)
    """
    try:
        conversation_id = request.args.get('conversation_id', type=int)
        
        if conversation_id:
            messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.date_creation.asc()).all()
        else:
            messages = Message.query.order_by(Message.date_creation.desc()).all()
        
        return jsonify({
            'success': True,
            'messages': [msg.to_dict() for msg in messages]
        }), 200
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500


@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    """
    Récupérer la liste de toutes les conversations
    """
    try:
        conversations = Conversation.query.order_by(Conversation.date_modification.desc()).all()
        return jsonify({
            'success': True,
            'conversations': [conv.to_dict() for conv in conversations]
        }), 200
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500


@app.route('/api/conversations', methods=['POST'])
def create_conversation():
    """
    Créer une nouvelle conversation
    """
    try:
        data = request.get_json()
        titre = data.get('titre', 'Nouvelle Discussion')
        
        nouvelle_conversation = Conversation(titre=titre)
        db.session.add(nouvelle_conversation)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': nouvelle_conversation.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500


@app.route('/api/conversations/<int:conv_id>', methods=['GET'])
def get_conversation(conv_id):
    """
    Récupérer les détails d'une conversation avec ses messages
    """
    try:
        conversation = Conversation.query.get(conv_id)
        if not conversation:
            return jsonify({'error': 'Conversation introuvable'}), 404
        
        messages = Message.query.filter_by(conversation_id=conv_id).order_by(Message.date_creation.asc()).all()
        
        return jsonify({
            'success': True,
            'data': conversation.to_dict(),
            'messages': [msg.to_dict() for msg in messages]
        }), 200
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500


@app.route('/api/conversations/<int:conv_id>', methods=['PUT'])
def update_conversation(conv_id):
    """
    Mettre à jour le titre d'une conversation
    """
    try:
        conversation = Conversation.query.get(conv_id)
        if not conversation:
            return jsonify({'error': 'Conversation introuvable'}), 404
        
        data = request.get_json()
        if 'titre' in data:
            conversation.titre = data['titre']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': conversation.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500


@app.route('/api/conversations/<int:conv_id>', methods=['DELETE'])
def delete_conversation(conv_id):
    """
    Supprimer une conversation et tous ses messages
    """
    try:
        conversation = Conversation.query.get(conv_id)
        if not conversation:
            return jsonify({'error': 'Conversation introuvable'}), 404
        
        # Supprimer tous les messages de la conversation
        Message.query.filter_by(conversation_id=conv_id).delete()
        db.session.delete(conversation)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Conversation supprimée'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500


@app.route('/api/send-from-model', methods=['POST'])
def send_from_model():
    try:
        data = request.get_json()

        if not data or 'message' not in data or 'conversation_id' not in data:
            return jsonify({
                'error': 'Les champs "message" et "conversation_id" sont requis'
            }), 400

        message_ai = Message(
            contenu=data['message'],
            type='ai',
            conversation_id=data['conversation_id']
        )

        db.session.add(message_ai)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Message du modèle enregistré',
            'data': message_ai.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500


@app.route('/api/bdd/file', methods=['GET'])
def get_uploaded_files():
    """
    Récupérer le dernier fichier SQL uploadé
    """
    try:
        # Récupérer uniquement le dernier fichier ajouté
        dernier_fichier = BDD.query.order_by(BDD.date_upload.desc()).first()
        
        if dernier_fichier:
            return jsonify({
                'success': True,
                'fichier': dernier_fichier.to_dict()
            }), 200
        else:
            return jsonify({
                'success': True,
                'fichier': None,
                'message': 'Aucun fichier trouvé'
            }), 200
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500


# ==================== INITIALISATION ====================

def init_test_data():
    """Initialiser des données de test"""
    # Vérifier si des conversations et données existent déjà
    if Conversation.query.first() is None:
        print("[INFO] Creation des donnees de test...")
        
        # Créer une conversation de test
        test_conversation = Conversation(titre="Discussion Générale")
        db.session.add(test_conversation)
        db.session.commit()
        
        # Messages de test
        test_messages = [
            Message(conversation_id=test_conversation.id, contenu="Bonjour, comment puis-je vous aider ?", type="ai"),
            Message(conversation_id=test_conversation.id, contenu="Peux-tu m'expliquer le système ?", type="user"),
            Message(conversation_id=test_conversation.id, contenu="Bien sûr ! Je suis votre assistant IA. Je peux traiter des messages texte et audio, analyser des données SQL, et bien plus encore.", type="ai"),
            Message(conversation_id=test_conversation.id, contenu="Comment puis-je uploader un fichier SQL ?", type="user"),
            Message(conversation_id=test_conversation.id, contenu="Vous pouvez uploader un fichier SQL via l'endpoint /api/upload-sql. Le fichier sera stocké dans la base de données.", type="ai"),
        ]
        
        for msg in test_messages:
            db.session.add(msg)
        
        # Fichier BDD de test
        test_file = BDD(
            nom_fichier="init_database.sql",
            taille=2048
        )
        db.session.add(test_file)
        
        db.session.commit()
        print("[OK] Donnees de test creees avec succes !")
    else:
        print("[INFO] Donnees deja presentes, pas d'initialisation.")


@app.before_request
def create_tables():
    """Créer les tables si elles n'existent pas"""
    db.create_all()


def add_missing_columns():
    """Ajouter les colonnes manquantes aux tables existantes"""
    with app.app_context():
        try:
            inspector = inspect(db.engine)
            
            # Vérifier si la colonne 'contenu' existe dans la table 'bdd'
            bdd_columns = [col['name'] for col in inspector.get_columns('bdd')]
            if 'contenu' not in bdd_columns:
                print("[DEBUG] Ajout de la colonne 'contenu' a la table 'bdd'...")
                db.session.execute(db.text("ALTER TABLE bdd ADD COLUMN contenu LONGTEXT NULL"))
                db.session.commit()
                print("[SUCCESS] Colonne 'contenu' ajoutee avec succes")
            
            # Vérifier si la colonne 'conversation_id' existe dans la table 'messages'
            msg_columns = [col['name'] for col in inspector.get_columns('messages')]
            if 'conversation_id' not in msg_columns:
                print("[DEBUG] Ajout de la colonne 'conversation_id' a la table 'messages'...")
                # Créer une conversation par défaut
                default_conv = Conversation(titre="Discussion Générale")
                db.session.add(default_conv)
                db.session.commit()
                default_conv_id = default_conv.id
                
                # Ajouter la colonne avec une valeur par défaut
                db.session.execute(db.text(f"ALTER TABLE messages ADD COLUMN conversation_id INT NOT NULL DEFAULT {default_conv_id}"))
                db.session.execute(db.text("ALTER TABLE messages ADD FOREIGN KEY (conversation_id) REFERENCES conversations(id)"))
                db.session.commit()
                print("[SUCCESS] Colonne 'conversation_id' ajoutee avec succes")
        except Exception as e:
            print(f"[WARNING] Impossible d'ajouter la colonne: {str(e)}")


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        add_missing_columns()
        init_test_data()
    
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=True
    )
