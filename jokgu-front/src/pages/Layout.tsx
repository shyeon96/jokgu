import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, Users, Calendar, MapPin, LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handler = () => setMyOpen(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        toast.success("로그아웃", {style: {background: '#22c55e', color: 'white'}});
        navigate('/login', { replace: true });
    };

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [myOpen, setMyOpen] = useState<boolean>(false);
    const user = sessionStorage.getItem("user");

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-dvh bg-gray-50/40 flex flex-col">
            {/* Sticky glassmorphism header */}
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100/80">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
                    <nav className="flex justify-between items-center h-[56px] md:h-[64px]">
                        <div className="flex items-center gap-8">
                            <Link to="/" className="hover:opacity-90 transition shrink-0 flex items-center">
                                <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3182F6] to-[#6366f1] text-white flex items-center justify-center shadow-md shadow-blue-500/10">
                                    <Users size={16} />
                                </span>
                            </Link>
                            
                            <div className="hidden md:flex gap-2">
                                <Link to="/groups" 
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 font-medium ${
                                        isActive('/groups') 
                                        ? 'text-[#3182F6] bg-blue-50/60' 
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/80'}`}>
                                    <Users size={20} />
                                    <span className="text-base">모임</span>
                                </Link>
                                <Link to="/plans" 
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1.5 font-medium ${
                                        isActive('/plans') 
                                        ? 'text-[#3182F6] bg-blue-50/60' 
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/80' }`}>
                                    <Calendar size={20} />
                                    <span className="text-base">일정</span>
                                </Link>
                                <Link to="/fields" 
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1.5 font-medium ${
                                        isActive('/fields') 
                                        ? 'text-[#3182F6] bg-blue-50/60' 
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/80'}`}>
                                    <MapPin size={20} />
                                    <span className="text-base">경기장</span>
                                </Link>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {user && (
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setMyOpen(!myOpen); }}
                                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition cursor-pointer font-medium">
                                        <span className="md:text-base">{user}</span>
                                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${myOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {myOpen && (
                                        <div className="absolute right-0 top-full mt-1 w-[120px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 py-1">
                                            <Link to="/mypage" onClick={() => setMyOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                                                <UserIcon size={14} className="text-gray-400" />
                                                <span className="font-medium">마이페이지</span>
                                            </Link>
                                            <button onClick={() => { setMyOpen(false); logout(); }}
                                                className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50/50 transition cursor-pointer border-t border-gray-100">
                                                <LogOut size={14} className="text-red-400" />
                                                <span className="font-semibold">로그아웃</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <button 
                                className="md:hidden p-1.5 rounded-lg hover:bg-gray-50 text-gray-600 transition cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                                {isOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </nav>
                </div>
            </header>

            <div className={`md:hidden bg-white border-b border-gray-100 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 py-2.5 space-y-1">
                    <Link to="/groups" onClick={() => setIsOpen(false)} 
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                            isActive('/groups') 
                            ? 'text-[#3182F6] bg-blue-50/40' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`} >
                        <Users size={16} className={isActive('/groups') ? 'text-[#3182F6]' : 'text-gray-400'} />
                        <span>모임</span>
                    </Link>
                    <Link to="/plans" onClick={() => setIsOpen(false)} 
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                            isActive('/plans') 
                            ? 'text-[#3182F6] bg-blue-50/40' 
                            : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Calendar size={16} className={isActive('/plans') ? 'text-[#3182F6]' : 'text-gray-400'} />
                        <span>일정</span>
                    </Link>
                    <Link to="/fields"  onClick={() => setIsOpen(false)} 
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                            isActive('/fields') 
                            ? 'text-[#3182F6] bg-blue-50/40' 
                            : 'text-gray-600 hover:bg-gray-50'}`}>
                        <MapPin size={16} className={isActive('/fields') ? 'text-[#3182F6]' : 'text-gray-400'} />
                        <span>경기장</span>
                    </Link>
                </div>
            </div>
    
            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-3 md:px-4 py-4">
                <Outlet />
            </main>
        </div>
    );
}