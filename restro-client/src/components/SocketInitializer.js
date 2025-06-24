// 'use client';

// import { useEffect } from 'react';

// export default function SocketInitializer() {
//   useEffect(() => {
//     // Initialize socket connection by calling the socket API route
//     const initializeSocket = async () => {
//       try {
//         console.log('🔌 Initializing socket connection...');
//         const response = await fetch('/api/socket');
//         if (response.ok) {
//           console.log('✅ Socket server initialized successfully');
//         } else {
//           console.error('❌ Failed to initialize socket server');
//         }
//       } catch (error) {
//         console.error('❌ Error initializing socket:', error);
//       }
//     };

//     initializeSocket();
//   }, []);

//   // This component doesn't render anything
//   return null;
// } 