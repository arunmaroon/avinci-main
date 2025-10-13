import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SocketTest = () => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [callId, setCallId] = useState('');
    const [roomName, setRoomName] = useState('');

    useEffect(() => {
        const newSocket = io('http://localhost:9001');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('🔌 Connected to Socket.IO');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Disconnected from Socket.IO');
            setConnected(false);
        });

        newSocket.on('agent-response', (data) => {
            console.log('🤖 Received agent-response:', data);
            setMessages(prev => [...prev, { type: 'agent-response', data, timestamp: new Date() }]);
        });

        newSocket.on('agent-typing', (data) => {
            console.log('⌨️ Received agent-typing:', data);
            setMessages(prev => [...prev, { type: 'agent-typing', data, timestamp: new Date() }]);
        });

        newSocket.on('user-joined', (data) => {
            console.log('👤 User joined:', data);
            setMessages(prev => [...prev, { type: 'user-joined', data, timestamp: new Date() }]);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    const joinCall = () => {
        if (socket && callId) {
            const room = roomName || `call-${callId}`;
            console.log('🔌 Joining call:', { callId, roomName: room });
            socket.emit('join-call', { callId, roomName: room });
            setMessages(prev => [...prev, { type: 'join-call', data: { callId, roomName: room }, timestamp: new Date() }]);
        }
    };

    const testAgentResponse = () => {
        if (socket && callId) {
            const room = roomName || `call-${callId}`;
            console.log('🧪 Testing agent response to room:', room);
            socket.emit('agent-response', {
                callId,
                roomName: room,
                responseText: 'This is a test response',
                agentName: 'Test Agent',
                audioUrl: null
            });
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Socket.IO Test</h1>
            
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                    <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Socket.IO Status: {connected ? 'Connected' : 'Disconnected'}</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Call ID:</label>
                        <input
                            type="text"
                            value={callId}
                            onChange={(e) => setCallId(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="Enter call ID"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Room Name (optional):</label>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="Enter room name (defaults to call-{callId})"
                        />
                    </div>
                    
                    <div className="flex space-x-4">
                        <button
                            onClick={joinCall}
                            disabled={!socket || !callId}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        >
                            Join Call
                        </button>
                        
                        <button
                            onClick={testAgentResponse}
                            disabled={!socket || !callId}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                        >
                            Test Agent Response
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Messages:</h2>
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {messages.length === 0 ? (
                        <p className="text-gray-500">No messages yet</p>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                                <div className="text-sm font-medium text-gray-600">
                                    {msg.type} - {msg.timestamp.toLocaleTimeString()}
                                </div>
                                <pre className="text-xs text-gray-800 mt-1">
                                    {JSON.stringify(msg.data, null, 2)}
                                </pre>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocketTest;
