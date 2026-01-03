export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-[-20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-[-20%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                {children}
            </div>
        </div>
    );
}
