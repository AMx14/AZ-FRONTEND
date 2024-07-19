/*import React, { useState, useEffect, useContext } from 'react';
import { Grid, Paper, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import Questions from './Questions';

const socket = io('http://localhost:8080');

const StartGame = ({ lobbyId }) => {
  const [gid, setGid] = useState('');
  const [email, setEmail] = useState(''); // from access token or params or props
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [lobbyOwnerEmail, setLobbyOwnerEmail] = useState('');
  const navigate = useNavigate();
  const { userEmail } = useContext(UserContext); // Assuming UserContext provides the user's email

  useEffect(() => {
    // Fetch lobby details
    const fetchLobbyDetails = async () => {
      try {
        const response = await axios.get('http://localhost:8085/lobbies/listLobby');
        const lobby = response.data.find(lobby => lobby.lid === lobbyId);
        if (lobby) {
          setLobbyOwnerEmail(lobby.lowneremail);
        }
      } catch (error) {
        console.error('Error fetching lobby details:', error.message);
      }
    };

    fetchLobbyDetails();

    socket.emit('joinLobby', { lobbyId, participant: userEmail });
    socket.on('firstMcq', (data) => {
      alert('First MCQ received');
    });
  }, [lobbyId, userEmail]);

  const handleGidChange = (event) => setGid(event.target.value);

  const handleStartGame = async (event) => {
    event.preventDefault();
    if (!gid) {
      setError('Please provide the game ID.');
      return;
    }
    if (userEmail !== lobbyOwnerEmail) {
      alert('Only the lobby creator can start the game.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8085/games/startGame', {
        gid,
        lid: lobbyId,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        alert('Game started successfully');
        socket.emit('gameStarted', { lobbyId, message: 'game started' });
        // Fetch the first MCQ
        const mcqData = await fetchMcq('1', lobbyId);
        setQuestions(mcqData);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start the game');
    }
  };

  const fetchMcq = async (qid, lid) => {
    try {
      const response = await axios.post('http://localhost:8085/mcqs/readMcq', {
        qid,
        lid,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(userEmail)}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch MCQ');
      }

      const data = await response.json();
      return data.cachedMcq ? [data.cachedMcq] : [];
    } catch (error) {
      console.error('Error fetching MCQ:', error.message);
      throw error;
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Handle end of questions or result page navigation
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Paper elevation={10} style={{ padding: 20, width: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Start Game
        </Typography>
        {error && <Typography color="error" align="center">{error}</Typography>}
        <form onSubmit={handleStartGame}>
          <TextField
            label="Lobby ID"
            placeholder="Enter lobby ID"
            fullWidth
            required
            value={lobbyId}
            readOnly
            style={{ marginBottom: 16 }}
          />
          <TextField
            label="Game ID"
            placeholder="Enter game ID"
            fullWidth
            required
            value={gid}
            onChange={handleGidChange}
            style={{ marginBottom: 16 }}
          />
          <TextField
            label="Email"
            placeholder="Enter email"
            fullWidth
            required
            value={userEmail}
            readOnly
            style={{ marginBottom: 16 }}
          />
          <Button
            type="submit"
            color="primary"
            variant="contained"
            fullWidth
          >
            Start Game
          </Button>
        </form>
        {questions.length > 0 && (
          <div>
            <Questions question={questions[currentQuestion]} />
            <div>
              {currentQuestion > 0 && (
                <Button onClick={handlePrevQuestion} variant="outlined">Previous</Button>
              )}
              {currentQuestion < questions.length - 1 && (
                <Button onClick={handleNextQuestion} variant="outlined">Next</Button>
              )}
            </div>
          </div>
        )}
      </Paper>
    </Grid>
  );
};

export default StartGame;

import React, { useState, useEffect, useContext } from 'react';
import { Grid, Paper, TextField, Button, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { UserContext } from './UserContext';

const socket = io('http://localhost:8080');

const StartGame = () => {
  const { lid } = useParams();
  const navigate = useNavigate();
  const { email } = useContext(UserContext);
  const [lobbyOwnerEmail, setLobbyOwnerEmail] = useState('');
  const [error, setError] = useState('');
  const accessToken = localStorage.getItem(email);

  useEffect(() => {
    if (!accessToken) {
      console.error('No access token found. Please log in.');
      navigate('/login');
      return;
    }

    const fetchLobbyDetails = async () => {
      try {
        const response = await axios.get('http://localhost:8085/lobbies/listLobby', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const lobby = response.data.find(lobby => lobby.lid === lid);
        console.log(lobby);
        if (lobby) {
          setLobbyOwnerEmail(lobby.lowneremail);
        } else {
          setError('Lobby not found');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch lobby details');
      }
    };

    fetchLobbyDetails();

    socket.emit('joinLobby', { lobbyId: lid, participant: email });
    socket.on('firstMcq', (data) => {
      alert('First MCQ received');
    });

  }, [lid, email, accessToken, navigate]);

  const handleStartGame = async (event) => {
    event.preventDefault();

    if (email !== lobbyOwnerEmail) {
      alert('Only the lobby creator can start the game');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8085/games/startGame', {
        gid: lid,
        lid,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200) {
        alert('Game started successfully');
        socket.emit('gameStarted', { lobbyId: lid, message: 'game started' });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start game');
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Paper elevation={10} style={{ padding: 20, width: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Start Game
        </Typography>
        {error && <Typography color="error" align="center">{error}</Typography>}
        <form onSubmit={handleStartGame}>
          <TextField
            label="Lobby ID"
            fullWidth
            required
            value={lid}
            InputProps={{ readOnly: true }}
            style={{ marginBottom: 16 }}
          />
          <TextField
            label="Game ID"
            fullWidth
            required
            value={lid}
            InputProps={{ readOnly: true }}
            style={{ marginBottom: 16 }}
          />
          <TextField
            label="Email"
            fullWidth
            required
            value={email}
            InputProps={{ readOnly: true }}
            style={{ marginBottom: 16 }}
          />
          <Button
            type="submit"
            color="primary"
            variant="contained"
            fullWidth
          >
            Start Game
          </Button>
        </form>
      </Paper>
    </Grid>
  );
};

export default StartGame;
*/
import React, { useState, useEffect, useContext } from 'react';
import { Grid, Paper, TextField, Button, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { UserContext } from './UserContext';

const socket = io('http://localhost:8085');

const StartGame = () => {
  const { lobbyId } = useParams();  // Use the correct param name from your routes
  const navigate = useNavigate();
  const { email } = useContext(UserContext);
  const [lobbyOwnerEmail, setLobbyOwnerEmail] = useState('');
  const [error, setError] = useState('');
  const accessToken = localStorage.getItem(email); // Assuming accessToken is stored in localStorage

  useEffect(() => {
    console.log('useEffect called');
    console.log('LID from params:', lobbyId);

    if (!accessToken) {
      console.error('No access token found. Please log in.');
      navigate('/login');
      return;
    }

    const fetchLobbyDetails = async () => {
      try {
        const response = await axios.get('http://localhost:8085/lobbies/listLobby', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        console.log('Lobbies fetched:', response.data);

        const lobby = response.data.find(lobby => lobby.lid === lobbyId);
        if (lobby) {
          console.log('Lobby found:', lobby);
          setLobbyOwnerEmail(lobby.lowneremail);
        } else {
          console.log('Lobby not found');
          setError('Lobby not found');
        }
      } catch (error) {
        console.error('Error fetching lobby details:', error);
        setError(error.response?.data?.message || 'Failed to fetch lobby details');
      }
    };

    fetchLobbyDetails();

    socket.emit('joinLobby', { lobbyId: lobbyId, participant: email });
    socket.on('firstMcq', (data) => {
      alert('First MCQ received');
      console.log(data.mcq);

    });

  }, [lobbyId, email, accessToken, navigate]);

  const handleStartGame = async (event) => {
    event.preventDefault();

    if (email !== lobbyOwnerEmail) {
      alert('Only the lobby creator can start the game');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8085/games/startGame', {
        gid: lobbyId,
        lid: lobbyId,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200) {
        alert('Game started successfully');
        console.log(response.data.mcq);


        socket.emit('gameStarted', { lobbyId: lobbyId, message: 'game started', mcq: response.data.mcq });

      }
    } catch (error) {
      console.error('Error starting game:', error);
      setError(error.response?.data?.message || 'Failed to start game');
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Paper elevation={10} style={{ padding: 20, width: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Start Game
        </Typography>
        {error && <Typography color="error" align="center">{error}</Typography>}
        <form onSubmit={handleStartGame}>
          <TextField
            label="Lobby ID"
            fullWidth
            required
            value={lobbyId}
            InputProps={{ readOnly: true }}
            style={{ marginBottom: 16 }}
          />
          <TextField
            label="Game ID"
            fullWidth
            required
            value={lobbyId}
            InputProps={{ readOnly: true }}
            style={{ marginBottom: 16 }}
          />
          <TextField
            label="Email"
            fullWidth
            required
            value={email}
            InputProps={{ readOnly: true }}
            style={{ marginBottom: 16 }}
          />
          <Button
            type="submit"
            color="primary"
            variant="contained"
            fullWidth
          >
            Start Game
          </Button>
        </form>
      </Paper>
    </Grid>
  );
};

export default StartGame;
