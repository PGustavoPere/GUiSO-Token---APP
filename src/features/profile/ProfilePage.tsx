import React, { useState, useMemo } from 'react';
import { Wallet, Award, History, ExternalLink, ShieldCheck, LogOut, Heart, Sparkles, User, Edit2, X, Check, PieChart as PieChartIcon, Medal, Zap, Camera, ArrowUpRight, ArrowDownLeft, Copy, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { useWallet } from '../../core/WalletProvider';
import { impactEngine } from '../../system/impactEngine';
import { Card, Button, Badge } from '../../components/ui';
import { ActivityTimeline } from '../../components/ActivityTimeline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { QRScanner } from '../../components/QRScanner';
import ImpactTransactionPanel from '../../components/ImpactTransactionPanel';

const COLORS = ['#FF6321', '#5A5A40', '#141414', '#F27D26', '#E4E3E0'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { 
    user,
    token,
    global,
    updateProfile,
    transferTokens
  } = useGuisoCore();
  const { address, isConnected, connect, disconnect, isConnecting } = useWallet();

  const [isEditing, setIsEditing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user.username,
    bio: user.bio || '',
    avatar: user.avatar || ''
  });

  const handleScan = (decodedText: string) => {
    if (decodedText.includes('/pay/')) {
      const paymentId = decodedText.split('/pay/')[1];
      if (paymentId) {
        navigate(`/pay/${paymentId}`);
      }
    } else if (decodedText.startsWith('PAY-')) {
      navigate(`/pay/${decodedText}`);
    } else {
      alert("Código QR no reconocido como un pago de GUISO.");
    }
    setShowScanner(false);
  };

  const impactScore = user.impactScore;
  const communityLevel = user.communityLevel;
  const isWalletConnected = isConnected;
  const balance = token.gsoBalance;
  const history = token.transactions;
  const totalSupportedCauses = global.supportedCauses;

  const nextThreshold = impactEngine.getNextThreshold(impactScore);
  const currentThreshold = impactEngine.calculateLevel(impactScore);
  
  const progress = nextThreshold 
    ? ((impactScore - currentThreshold.minPoints) / (nextThreshold.minPoints - currentThreshold.minPoints)) * 100 
    : 100;

  const impactByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    history.forEach(tx => {
      if (tx.type === 'support' || tx.type === 'donation') {
        const cat = tx.category || 'General';
        categories[cat] = (categories[cat] || 0) + tx.impactPoints;
      }
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [history]);

  const handleConnect = () => {
    connect();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Base64 storage
        alert("La imagen es muy pesada. Por favor, subí una de menos de 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  if (!isWalletConnected) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-guiso-orange/10 rounded-3xl flex items-center justify-center text-guiso-orange mb-4">
          <Wallet size={48} />
        </div>
        <h1 className="text-4xl font-display font-bold">Conecta tu Wallet</h1>
        <p className="text-gray-500 max-w-md">Para ver tu balance de GSO y participar en la validación del ecosistema, necesitas conectar tu cartera Web3.</p>
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          size="lg"
          className="flex items-center gap-2 px-10"
        >
          {isConnecting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Wallet size={20} />
              Conectar Wallet
            </>
          )}
        </Button>
        <p className="text-xs text-gray-400">Soportamos MetaMask, WalletConnect y Coinbase Wallet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-guiso-orange to-guiso-terracotta rounded-3xl flex items-center justify-center text-white text-2xl md:text-4xl font-bold shrink-0 overflow-hidden shadow-xl border-4 border-white">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                address?.substring(2, 4).toUpperCase() || 'G'
              )}
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md text-gray-400 hover:text-guiso-orange transition-colors border border-gray-100"
            >
              <Edit2 size={14} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-2xl md:text-3xl font-display font-bold truncate">
                  {user.username}
                </h1>
                <ShieldCheck size={20} className="text-blue-500 shrink-0" />
              </div>
            </div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-2">{user.communityLevel}</p>
            <p className="text-gray-400 text-xs md:text-sm max-w-md italic">
              {user.bio}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-[10px] md:text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-500 flex items-center gap-2">
                {address?.slice(0, 6)}...{address?.slice(-4)}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(address || '');
                    alert('Dirección copiada');
                  }}
                  className="hover:text-guiso-orange transition-colors"
                >
                  <Copy size={12} />
                </button>
              </code>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card variant="dark" padding="md" rounded="2xl" className="relative overflow-hidden">
              <p className="text-white/60 text-xs md:text-sm mb-1 uppercase tracking-widest font-bold">Balance GSO</p>
              <h3 className="text-3xl md:text-4xl font-display font-bold mb-4">{balance.toLocaleString()} GSO</h3>
              
              <div className="space-y-3">
                <div className="flex gap-2 md:gap-3">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => setShowSendModal(true)}
                  >
                    <ArrowUpRight size={14} />
                    Enviar
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => setShowReceiveModal(true)}
                  >
                    <ArrowDownLeft size={14} />
                    Recibir
                  </Button>
                </div>
                
                <div className="flex gap-2 md:gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 flex items-center justify-center gap-2 border-white/20 text-white hover:bg-white/10"
                    onClick={() => setShowScanner(true)}
                  >
                    <Camera size={14} />
                    Escanear Pago
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 flex items-center justify-center gap-2 border-white/20 text-white hover:bg-white/10"
                    onClick={() => setShowSupportModal(true)}
                  >
                    <Heart size={14} />
                    Apoyar Causa
                  </Button>
                </div>
              </div>
            </Card>

            <Card variant="glass" padding="md" rounded="2xl" className="flex flex-col justify-between">
              <div>
                <p className="text-gray-500 text-xs md:text-sm mb-1 uppercase tracking-widest font-bold">Puntos de Impacto</p>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-guiso-orange">{impactScore} IP</h3>
              </div>
              <div className="mt-4 md:mt-6 flex items-center gap-2 text-[10px] md:text-xs text-gray-400">
                <Sparkles size={14} className="text-guiso-orange" />
                Causas Apoyadas: {totalSupportedCauses}
              </div>
            </Card>
          </div>

          {/* History */}
          <Card variant="glass" padding="md" rounded="2xl" className="border-t-4 border-t-guiso-orange">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg md:text-xl font-display font-bold flex items-center gap-2">
                <History size={20} className="text-guiso-orange" />
                Tu Historia de Impacto
              </h3>
              <Badge variant="neutral" className="text-[10px] uppercase tracking-widest">
                Blockchain Verificada
              </Badge>
            </div>
            
            <ActivityTimeline activities={history} />
          </Card>

          {/* Certificates */}
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold flex items-center gap-2">
              <Award size={24} className="text-guiso-orange" />
              Certificados de Impacto (NFTs)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.certificates.map(cert => (
                <Card key={cert.id} variant="glass" padding="none" rounded="2xl" className="overflow-hidden group">
                  <div className="relative h-32 overflow-hidden">
                    <img 
                      src={cert.image} 
                      alt={cert.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="primary" className="text-[10px]">{cert.category}</Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-sm mb-1">{cert.name}</h4>
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>{new Date(cert.date).toLocaleDateString()}</span>
                      <span className="text-guiso-orange font-bold">+{cert.impactPoints} IP</span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-3 text-[10px] h-8">
                      Ver en Explorador <ExternalLink size={10} className="ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Identity Panel */}
          <Card variant="glass" padding="md" rounded="2xl" className="border-l-4 border-l-blue-500">
            <h4 className="font-display font-bold mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-500" />
              Identidad de Impacto
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Estado</span>
                <Badge variant="success" className="text-[10px]">Verificado</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Rol</span>
                <span className="font-bold">{user.communityLevel}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Antigüedad</span>
                <span className="font-bold">
                  {Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses
                </span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 italic">Tu identidad está respaldada por tus acciones verificadas en la red GUISO.</p>
              </div>
            </div>
          </Card>
          {/* Impact Distribution */}
          {impactByCategory.length > 0 && (
            <Card variant="glass" padding="sm" rounded="2xl">
              <h4 className="font-display font-bold mb-4 flex items-center gap-2">
                <PieChartIcon size={18} className="text-guiso-orange" />
                Distribución de Impacto
              </h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={impactByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {impactByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1">
                {impactByCategory.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between text-[10px] font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-gray-500">{entry.name}</span>
                    </div>
                    <span>{entry.value} IP</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Badges Section */}
          <Card variant="glass" padding="sm" rounded="2xl" className="border-guiso-orange/20">
            <h4 className="font-display font-bold mb-4 flex items-center gap-2">
              <Medal size={18} className="text-guiso-orange" />
              Tus Logros
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {user.badges.length > 0 ? (
                user.badges.map(badge => (
                  <div key={badge.id} className="group relative">
                    <div className="flex items-center gap-3 p-2 bg-guiso-cream/50 rounded-2xl border border-guiso-orange/10 hover:bg-guiso-orange/10 transition-all cursor-help">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-guiso-orange shadow-sm">
                        <span className="text-xl">{badge.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold truncate">{badge.name}</p>
                        <p className="text-[8px] text-gray-400 uppercase tracking-tighter font-bold">Rango: {user.communityLevel.split(' ')[0]}</p>
                      </div>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-guiso-dark text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-2xl">
                      <p className="font-bold mb-1 text-guiso-orange">{badge.name}</p>
                      <p className="opacity-70">{badge.description}</p>
                      <p className="mt-2 pt-2 border-t border-white/10 text-[8px] opacity-50">Obtenida el {new Date(badge.dateEarned).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-[10px] text-gray-400">Generá impacto para desbloquear medallas.</p>
                </div>
              )}
            </div>
          </Card>
          <Card variant="glass" padding="sm" rounded="2xl" className="border-guiso-orange/20">
            <h4 className="font-display font-bold mb-4">Progreso de Nivel</h4>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Nivel Actual</span>
                <span className="text-guiso-orange">
                  {impactScore} / {nextThreshold ? nextThreshold.minPoints : 'MAX'} IP
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-guiso-orange h-full transition-all duration-500" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-[10px] text-gray-400 text-center italic">
                {nextThreshold ? `Próximo rango: ${nextThreshold.level}` : '¡Has alcanzado el nivel máximo!'}
              </p>
            </div>
          </Card>
        </div>
      </div>
      {/* Modals */}
      <AnimatePresence>
        {showScanner && (
          <QRScanner 
            onScan={handleScan} 
            onClose={() => setShowScanner(false)} 
          />
        )}

        {showSupportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-guiso-cream/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-guiso-orange/10 rounded-xl text-guiso-orange">
                    <Heart size={20} />
                  </div>
                  <h3 className="text-xl font-display font-bold">Apoyar una Causa</h3>
                </div>
                <button onClick={() => setShowSupportModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <ImpactTransactionPanel onClose={() => setShowSupportModal(false)} />
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <Button variant="ghost" onClick={() => setShowSupportModal(false)} className="w-full">Cerrar</Button>
              </div>
            </motion.div>
          </div>
        )}

        {showSendModal && (
          <SendGsoModal 
            onClose={() => setShowSendModal(false)} 
            balance={balance} 
            onSend={(to, amount) => transferTokens(to, amount)}
          />
        )}

        {showReceiveModal && (
          <ReceiveGsoModal onClose={() => setShowReceiveModal(false)} address={address || ''} />
        )}

        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-display font-bold">Editar Perfil</h3>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre de Usuario</label>
                  <input 
                    type="text" 
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-guiso-orange/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bio</label>
                  <textarea 
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-guiso-orange/20 h-24 resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avatar</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200">
                      {editForm.avatar ? (
                        <img src={editForm.avatar} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden" 
                        id="avatar-upload"
                      />
                      <label 
                        htmlFor="avatar-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-guiso-orange/10 text-guiso-orange text-xs font-bold rounded-xl cursor-pointer hover:bg-guiso-orange/20 transition-colors"
                      >
                        Subir Imagen
                      </label>
                      <p className="text-[10px] text-gray-400">O pegá una URL abajo:</p>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={editForm.avatar}
                    onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-guiso-orange/20"
                    placeholder="https://..."
                  />
                  <p className="text-[10px] text-gray-400 italic">Podés usar una URL de imagen o un servicio como DiceBear.</p>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1">Cancelar</Button>
                <Button onClick={handleSaveProfile} className="flex-1">Guardar Cambios</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SendGsoModal({ onClose, balance, onSend }: { onClose: () => void, balance: number, onSend: (to: string, amount: number) => void }) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!to || !amount) return;
    setIsSending(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSend(to, Number(amount));
    
    setIsSending(false);
    setSuccess(true);
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-bold flex items-center gap-2">
              <ArrowUpRight className="text-guiso-orange" />
              Enviar GSO
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {success ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <Check size={40} />
              </div>
              <h4 className="text-xl font-bold">¡Envío Exitoso!</h4>
              <p className="text-gray-500">Tus tokens están en camino.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Dirección de Wallet</label>
                <input 
                  type="text" 
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-guiso-orange outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Monto GSO</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-guiso-orange outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    GSO
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">Disponible: {balance.toLocaleString()} GSO</p>
              </div>

              <Button 
                variant="primary" 
                className="w-full py-4 mt-4"
                disabled={!to || !amount || isSending}
                onClick={handleSend}
              >
                {isSending ? 'Enviando...' : 'Confirmar Envío'}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ReceiveGsoModal({ onClose, address }: { onClose: () => void, address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-bold flex items-center gap-2">
              <ArrowDownLeft className="text-guiso-orange" />
              Recibir GSO
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center p-4">
              {/* Mock QR Code */}
              <div className="w-full h-full bg-white rounded-lg flex items-center justify-center border-4 border-gray-50">
                <QrCode size={120} className="text-gray-800" />
              </div>
            </div>

            <div className="w-full space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Tu Dirección de Wallet</label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <code className="flex-1 text-xs text-gray-600 truncate">{address}</code>
                <button 
                  onClick={handleCopy}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-guiso-orange"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Asegurate de enviar solo tokens GSO a esta dirección en la red compatible.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

function Coins({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}
