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
