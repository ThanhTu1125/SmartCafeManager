import AuthCard from "../components/AuthCard";

export default function AuthLayout({ title, subtitle, children }) {
    return (
        <AuthCard title={title} subtitle={subtitle}>
            {children}
        </AuthCard>
    );
}
