import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuration de base pour Flask"""
    
    # Base de données MySQL
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '3306')
    DB_NAME = os.getenv('DB_NAME', 'sadop')
    
    SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Sécurité
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-this-in-production')
    
    # Upload
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB max
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    
    # API Keys
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    
    # Serveur
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'


class DevelopmentConfig(Config):
    """Configuration pour le développement"""
    DEBUG = True


class ProductionConfig(Config):
    """Configuration pour la production"""
    DEBUG = False


# Choisir la configuration selon l'environnement
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
