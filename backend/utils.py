import sounddevice as sd
import numpy as np
import wave
import re
import io
import soundfile as sf
import os
import tempfile
# from playsound import playsound  # Non utilisé dans le backend
from groq import Groq
import librosa


# Client Groq initialisé dans les fonctions pour éviter les erreurs au démarrage

# def speak_with_tts(text: str) -> str:
#     print(f"[TTS] Texte reçu : {text}")
# 
#     # Génère le TTS avec GROQ
#     speech_file_path = os.path.join(tempfile.gettempdir(), "speech.wav")
#     response = client.audio.speech.create(
#         model="canopylabs/orpheus-v1-english",
#         voice="autumn",
#         input=text,
#         response_format="wav"
#     )
#     response.write_to_file(speech_file_path)
# 
#     # 🔊 Lecture audio automatique
#     playsound(speech_file_path)
# 
#     return text


def transcribe_audio(audio_buffer):
    try:
        print("[TRANSCRIBE] En pleine transcription...")
        
        
        # Vérifier que le buffer est au bon endroit
        if hasattr(audio_buffer, 'seek'):
            audio_buffer.seek(0)    
        
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not configured")
        
        print("[TRANSCRIBE] Initialisation client Groq...")
        client = Groq(api_key=api_key)

        print("[TRANSCRIBE] Envoi à l'API Whisper...")
        transcription = client.audio.transcriptions.create(
            file=("audio.wav", audio_buffer),
            model="whisper-large-v3",
            response_format="verbose_json",
        )

        result_text = transcription.text
        print(f"[TRANSCRIBE] Succès! Texte: {result_text}")
        return result_text
        
    except Exception as e:
        print(f"[ERROR] Erreur lors de la transcription: {str(e)}")
        print(f"[ERROR] Type d'erreur: {type(e).__name__}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise



def record_audio(duration=3, samplerate=16000):
    print("Enregistrement en cours...")
    
    audio_data = sd.rec(int(samplerate * duration), samplerate=samplerate, channels=1, dtype='int16')
    sd.wait()
    
    # Créer un fichier WAV en mémoire
    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(samplerate)
        wf.writeframes(audio_data.tobytes())
    
    print("Enregistrement terminé ")
    wav_buffer.seek(0)  # Revenir au début du buffer
    return wav_buffer

def load_audio_from_bytesio(audio_bytesio):
    audio_bytesio.seek(0)  # revenir au début
    wav, sr = librosa.load(audio_bytesio, sr=16000)  # convertit en array float32
    return wav

