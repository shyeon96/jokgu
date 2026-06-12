import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import api from '../../api/axios'
import { useMutation } from "@tanstack/react-query";
import type { ApiResponse, SignupForm } from "../../types";
import { toast } from "sonner";
import { Frown, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";

export default function Signup() {

    const { register, handleSubmit } = useForm<SignupForm>();
    const navigate = useNavigate();
    const location = useLocation();

    const anime = location.state?.fromLogin;
    const { mutate, isPending } = useMutation({
        mutationFn: async (data: SignupForm) => {
            const response = await api.post<ApiResponse>('/users/signup', data);
            return response.data;
        },
        onSuccess: () => {
                toast.success("회원가입 완료", { style: { background: '#22c55e', color: 'white' }, icon: <PartyPopper /> });
                navigate("/login");
        },
        onError: (error) => {
            toast.error(`${error.message}`, { style: { background: '#f43f5e', color: 'white' }, icon: <Frown /> });
        }
    })


    const onSubmit = async (data: SignupForm) => {
        mutate(data);
    }

    const token = sessionStorage.getItem('token');
    if (token) return <Navigate to="/main" />;

    return (
        <motion.div className="min-h-dvh flex items-center justify-center bg-gray-50"
            initial={anime ? { x: '100%', opacity: 0 }: false}
            animate={{ x: 0, opacity: 1 }}
            exit={anime ? { x: '100%', opacity: 0 } : undefined}
            transition={{ duration: 0.3 }}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-sm bg-white p-8 rounded-2xl shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-800">회원등록</h1>

                <div className="flex flex-col gap-1">
                    <label htmlFor="username" className="text-sm font-medium text-gray-600">아이디</label>
                    <input id="username" type="text" {...register('username', {
                        required: "아이디는 필수입니다", 
                        minLength: { value: 3, message: '아이디는 3자 이상이어야 합니다' },
                        maxLength: { value: 20, message: '아이디는 20자 이하이어야 합니다' } })} 
                        placeholder="아이디를 입력해주세요"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition"
                        autoComplete="username"/>
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="text-sm font-medium text-gray-600">비밀번호</label>
                    <input id="password" type="password" {...register('password', {
                        required: "비밀번호는 필수입니다",
                        minLength: { value: 3, message: '비밀번호는 3자 이상이어야 합니다' },
                        maxLength: { value: 30, message: '비밀번호는 30자 이하이어야 합니다' } })}
                        placeholder="비밀번호를 입력해주세요"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition"
                        autoComplete="new-password" />
                </div> 

                <div className="flex flex-col gap-1">
                    <label htmlFor="name" className="text-sm font-medium text-gray-600">이름</label>
                    <input id="name" type="text" {...register('name', {
                        required: "이름은 필수입니다",
                        minLength: { value: 2, message: '이름은 2자 이상이어야 합니다' },
                        maxLength: { value: 10, message: '이름은 10자 이하이어야 합니다' } })}
                        placeholder="이름을 입력해주세요"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition" />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="email" className="text-sm font-medium text-gray-600">이메일(권장)</label>
                    <input id="email" type="email" {...register('email')} 
                        placeholder="비밀번호 찾을때 이메일로 찾아요"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition"
                        autoComplete="email"/>
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="address" className="text-sm font-medium text-gray-600">주소(선택)</label>
                    <input id="address" type="text" {...register('address')} placeholder="주소를 입력하세요"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition" />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="account" className="text-sm font-medium text-gray-600">계좌번호(선택)</label>
                    <input id="account" type="text" {...register('account')} placeholder="은행-계좌명으로 입력해주세요"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition" />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-600">전화번호(선택)</label>
                    <input id="phone" type="tel" {...register('phone')} placeholder="전화번호를 입력하세요"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#22c55e] transition" />
                </div>

                <button type="submit" disabled={isPending}
                    className="bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-lg transition cursor-pointer">
                    {isPending ? '처리 중...' : '가입 신청'}
                </button>

                <p className="text-center text-sm text-gray-400">
                    이미 계정이 있으신가요?{' '}
                    <Link to="/login" state={{fromSignup: true}} className="text-[#3182F6] font-bold hover:underline">즉시 로그인</Link>
                </p>
            </form>
        </motion.div>
    )
}