import React, { useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Invite() {
  const wrapRef = useRef(null);
  const noBtnInlineRef = useRef(null); // botão NÃO no fluxo
  const noBtnFloatingRef = useRef(null); // botão NÃO flutuante
  const yesBtnRef = useRef(null);
  const textRef = useRef(null);

  const [accepted, setAccepted] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [isNoFloating, setIsNoFloating] = useState(false); // controla estado fujão
  const [noPos, setNoPos] = useState({ x: 0, y: 0 }); // posição do NÃO flutuante
  const [yesPos, setYesPos] = useState({ x: 0, y: 0 }); // posição inicial do SIM
  const [textPos, setTextPos] = useState({ x: 0, y: 0 }); // posição inicial do texto
  const [hearts, setHearts] = useState([]);

  // Quando vira flutuante, move dentro do wrapper
  const moveNo = () => {
    const wrap = wrapRef.current;
    const noEl =
      (isNoFloating ? noBtnFloatingRef.current : noBtnInlineRef.current) ||
      noBtnInlineRef.current;
    const yesEl = yesBtnRef.current;
    if (!wrap || !noEl || !yesEl) return;

    const wrapRect = wrap.getBoundingClientRect();
    const noRect = noEl.getBoundingClientRect();
    const yesRect = yesEl.getBoundingClientRect();

    const maxX = wrapRect.width - noRect.width;
    const maxY = wrapRect.height - noRect.height;
    const minDistance = 160;

    const farEnough = (x, y) => {
      const cx = x + noRect.width / 2;
      const cy = y + noRect.height / 2;
      const yesCx = yesRect.left - wrapRect.left + yesRect.width / 2;
      const yesCy = yesRect.top - wrapRect.top + yesRect.height / 2;
      return Math.hypot(cx - yesCx, cy - yesCy) > minDistance;
    };

    for (let i = 0; i < 28; i++) {
      const x = Math.random() * maxX;
      const y = Math.random() * maxY;
      if (farEnough(x, y)) {
        setNoPos({ x, y });
        return;
      }
    }
    setNoPos({ x: maxX, y: maxY }); // fallback
  };

  // Primeira interação com o NÃO: vira flutuante naquela mesma posição e já foge
  const activateFloatingNo = () => {
    if (isNoFloating) return;
    const wrap = wrapRef.current;
    const noInline = noBtnInlineRef.current;
    if (!wrap || !noInline) return;

    const wrapRect = wrap.getBoundingClientRect();
    const noRect = noInline.getBoundingClientRect();
    setNoPos({
      x: noRect.left - wrapRect.left,
      y: noRect.top - wrapRect.top,
    });
    setIsNoFloating(true);
    // na próxima pintura, foge
    requestAnimationFrame(moveNo);
  };

  const handleNoHover = () => {
    if (!isNoFloating) activateFloatingNo();
    else moveNo();
  };
  const handleNoPointerDown = (e) => {
    e.preventDefault();
    if (!isNoFloating) activateFloatingNo();
    else moveNo();
  };
  const handleNoFocus = () => {
    if (!isNoFloating) activateFloatingNo();
    else moveNo();
  };

  // Captura a posição inicial do botão SIM e do texto quando ambos estão no fluxo
  useLayoutEffect(() => {
    if (!isNoFloating && yesBtnRef.current && textRef.current && wrapRef.current) {
      const wrap = wrapRef.current;
      const yesEl = yesBtnRef.current;
      const textEl = textRef.current;
      const wrapRect = wrap.getBoundingClientRect();
      const yesRect = yesEl.getBoundingClientRect();
      const textRect = textEl.getBoundingClientRect();
      setYesPos({
        x: yesRect.left - wrapRect.left,
        y: yesRect.top - wrapRect.top,
      });
      setTextPos({
        x: textRect.left - wrapRect.left,
        y: textRect.top - wrapRect.top,
      });
    }
  }, [isNoFloating]);

  // 💖 corações com linhas/tempos aleatórios
  const Heart = ({ x, b, r, d, delay, s }) => (
    <motion.div
      initial={{ y: 0, opacity: 0, scale: s }}
      animate={{ y: -r, opacity: 1, scale: s * 1.05 }}
      exit={{ opacity: 0 }}
      transition={{ duration: d, ease: "easeOut", delay }}
      className="absolute text-3xl select-none pointer-events-none"
      style={{ left: x, bottom: b }}
    >
      💖
    </motion.div>
  );

  const celebrate = () => {
    setAccepted(true);
    setShowButtons(false);

    const wrap = wrapRef.current;
    if (!wrap) return;
    const { width, height } = wrap.getBoundingClientRect();
    const batch = Array.from({ length: 50 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * (width - 28),
      b: Math.random() * (height * 0.3) + 24,
      r: height * (0.5 + Math.random() * 0.45),
      d: 2.5 + Math.random() * 2,
      delay: Math.random() * 0.8,
      s: 0.6 + Math.random() * 0.7,
    }));
    setHearts((prev) => [...prev, ...batch]);
    const maxLife = Math.max(...batch.map((h) => h.d + h.delay));
    setTimeout(() => setHearts([]), (maxLife + 0.3) * 1000);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 to-rose-200 relative">
      {/* wrapper de tela inteira (referência do absoluto) */}
      <div
        ref={wrapRef}
        className="fixed inset-0 bg-white/70 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center text-center"
      >
        {/* corações */}
        <AnimatePresence>
          {hearts.map((h) => (
            <Heart key={h.id} {...h} />
          ))}
        </AnimatePresence>

        {/* texto */}
        {!isNoFloating ? (
          <h1
            ref={textRef}
            className="text-3xl sm:text-4xl font-bold text-rose-600 mb-8"
          >
            {accepted ? "Nonno nico então 😉" : "Gabriele, quer sair comigo?"}
          </h1>
        ) : (
          <h1
            ref={textRef}
            className="text-3xl sm:text-4xl font-bold text-rose-600 mb-8"
            style={{
              position: "absolute",
              left: `${textPos.x}px`,
              top: `${textPos.y}px`,
            }}
          >
            {accepted ? "Sabia que você não resistiria 😉" : "Gabriele, quer sair comigo?"}
          </h1>
        )}

        {/* Linha de botões perfeitamente centralizada */}
        {showButtons && (
          <>
            {/* Container flex apenas quando o NÃO está no fluxo */}
            {!isNoFloating && (
              <div className="flex gap-4 justify-center items-center">
                <button
                  ref={yesBtnRef}
                  onClick={celebrate}
                  className="px-6 py-3 rounded-2xl font-semibold shadow hover:shadow-md active:scale-[.98] transition border border-rose-300 bg-rose-500 text-white"
                >
                  Sim
                </button>

                {/* NÃO no fluxo até a primeira interação (garante alinhamento) */}
                <button
                  ref={noBtnInlineRef}
                  onMouseEnter={handleNoHover}
                  onPointerDown={handleNoPointerDown}
                  onFocus={handleNoFocus}
                  className="px-5 py-3 rounded-2xl font-semibold border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
                >
                  Não
                </button>
              </div>
            )}

            {/* SIM posicionado de forma absoluta quando o NÃO sai do fluxo */}
            {isNoFloating && (
              <button
                ref={yesBtnRef}
                onClick={celebrate}
                style={{
                  position: "absolute",
                  left: `${yesPos.x}px`,
                  top: `${yesPos.y}px`,
                }}
                className="px-6 py-3 rounded-2xl font-semibold shadow hover:shadow-md active:scale-[.98] transition border border-rose-300 bg-rose-500 text-white"
              >
                Sim
              </button>
            )}
          </>
        )}

        {/* NÃO flutuante (aparece só depois que vira fujão) */}
        {showButtons && isNoFloating && (
          <button
            ref={noBtnFloatingRef}
            onMouseEnter={handleNoHover}
            onPointerDown={handleNoPointerDown}
            onFocus={handleNoFocus}
            style={{
              position: "absolute",
              left: `${noPos.x}px`,
              top: `${noPos.y}px`,
              transition: "left 0.18s ease, top 0.18s ease",
              zIndex: 50,
            }}
            className="px-5 py-3 rounded-2xl font-semibold border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
          >
            Não
          </button>
        )}
      </div>
    </div>
  );
}
