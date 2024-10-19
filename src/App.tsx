import { useState, useEffect, useCallback } from 'react';
import { 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Box,
  TextField
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';


// Web Speech API の型定義
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function App() {
  const [ isListening, setIsListening ] = useState(false);
  const [ note, setNote ] = useState('');
  const [ savedNotes, setSavedNotes ] = useState('');
  const [ editing, setEditing ] = useState(false);

  // Web Speech API の設定
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'ja-JP';

  useEffect(() => {
    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');

      setNote(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    return () => {
      recognition.stop();
    };
  }, [isListening]);

  // Push to talk (Push [Space] key to start)
  const startListening = useCallback(() => {
    setNote("");
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!editing && event.code === 'Space' && !event.repeat && !isListening) {
        event.preventDefault();
        startListening();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!editing && event.code === 'Space' && isListening) {
        event.preventDefault();
        stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, startListening, stopListening]);

  const handleSaveNote = () => {
    setSavedNotes(
      (prevNotes) => prevNotes.trim() === "" ? note : prevNotes + '\n' + note
  );
    setNote('');
  };

  const handleListen = () => {
    setNote("");
    setIsListening(!isListening);
  };

  const copyClipBoard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {})
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        
      </Typography>
      <Box component="section">
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            1. 音声入力エリア
            <Typography variant="body2" color="text.secondary">
              [space] キーで音声入力を開始できます
            </Typography>
          </Typography>
          
          <TextField
            fullWidth
            multiline
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            variant="outlined"
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              color={isListening ? "secondary" : "primary"}
              startIcon={isListening ? <StopIcon /> : <MicIcon />}
              onClick={handleListen}
              sx={{ mr: 2, minWidth: '180px' }}
            >
              {isListening ? '終了' : '音声入力を開始'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleSaveNote}
              disabled={note.trim() === ''}
            >
              テキストを保存
            </Button>
          </Box>
        </Paper>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            2. 保存したテキストエリア
            <Typography variant="body2" color="text.secondary">
              テキストは手動で修正できます
            </Typography>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={savedNotes}
            onChange={(e) => setSavedNotes(e.target.value)}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            variant="outlined"
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              onClick={() => copyClipBoard(savedNotes)}
              color={"primary"}
              disabled={savedNotes.trim() === ''}
            >
              コピー
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSavedNotes("")}
              disabled={savedNotes.trim() === ''}
            >
              クリア
            </Button>
          </Box>

        </Paper>
      </Box>
    </Container>
  );
}
