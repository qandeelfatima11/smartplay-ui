import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-background text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold font-display text-foreground">Check Your Email</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <Link to="/login">
          <Button variant="outline" className="mx-auto">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-background">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🔑</div>
        <h1 className="text-2xl font-bold font-display text-foreground">Forgot Password?</h1>
        <p className="text-muted-foreground mt-1">Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="parent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link to="/login" className="text-primary hover:underline">
          <ArrowLeft className="inline h-3 w-3 mr-1" /> Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
