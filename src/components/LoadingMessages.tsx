import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const messages = [
  "Validando en la blockchain...",
  "Confirmando seguridad...",
  "Preparando tu certificado de impacto...",
  "Asegurando tu contribución...",
  "Transformando tu aporte en impacto..."
];

export default function LoadingMessages() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 overflow-hidden relative w-full flex justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-gray-500 absolute"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
