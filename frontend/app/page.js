'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
      <div className="text-center px-6">
        <div className="text-6xl mb-6">🚨</div>
        <h1 className="text-5xl font-bold mb-4 text-red-500">SafeCity</h1>
        <p className="text-xl text-gray-400 mb-10">AI-Powered Women Safety Platform for India</p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/register')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition"
          >
            Get Started
          </button>
          <button
            onClick={() => router.push('/login')}
            className="border border-red-600 text-red-500 hover:bg-red-600 hover:text-white px-8 py-3 rounded-full text-lg font-semibold transition"
          >
            Login
          </button>
        </div>
      </div>
    </main>
  );
}
