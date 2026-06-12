import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import api from '../../api/axios'
import type { loginForm } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface LoginRes {
    token: string,
    user: string
}

export default function Login() {

    const { register, handleSubmit } = useForm<loginForm>();
    const navigate = useNavigate();
    const location = useLocation();

    const anime = location.state?.fromSignup;

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: loginForm) => {
            const response = await api.post<LoginRes>('/users/login', data);
            return response.data;
        },
        onSuccess: (data) => {
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("user", data.user);
                toast.success("로그인", {style: {background: '#22c55e', color: 'white'}});
                navigate("/main", { replace: true });
        },
        onError: (error) => {
            toast.error(error.message, {style: {background: '#f43f5e', color: 'white'}})
        }
    })

    const onSubmit = async (data: loginForm) => {mutate(data);}

    const token = sessionStorage.getItem('token');
    if (token) return <Navigate to="/main" />;
    
    return (
        <motion.div className="min-h-dvh flex items-center justify-center bg-gray-50"
            initial={anime? {x: '-100%', opacity: 0}: false}
            animate={{x: 0, opacity: 1}}
            exit={anime ? {x:'-100%', opacity:0.3}: undefined}
            transition={{duration: 0.3}}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-sm bg-white p-8 rounded-2xl shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-800">로그인</h1>
    
                <div className="flex flex-col gap-1">
                    <label htmlFor="username" className="text-sm font-medium text-gray-600">아이디</label>
                    <input
                        id="username"
                        type="text"
                        {...register('username', {required: true})}
                        placeholder="아이디를 입력하세요"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition"
                        autoComplete="username"
                    />
                </div>
    
                <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="text-sm font-medium text-gray-600">비밀번호</label>
                    <input
                        id="password"
                        type="password"
                        {...register('password', {required: true})}
                        placeholder="비밀번호를 입력하세요"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition"
                        autoComplete="current-password"
                    />
                </div>
    
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-lg transition cursor-pointer"
                >
                    {isPending ? '로그인 중...' : '로그인'}
                </button>
    
                <p className="text-center text-sm text-gray-400">
                    처음이신가요?{' '}
                    <Link to="/signup" state={{fromLogin : true}} className="text-[#3182F6] font-bold hover:underline">즉시 회원가입</Link>
                </p>
            </form>
        </motion.div>
    )
}