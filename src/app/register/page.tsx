"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Car, Loader2 } from "lucide-react";

// --- プロジェクト共通のFirebase設定を使用 ---
import { initializeFirebase } from "@/firebase/init";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { useAuth, initiateEmailSignUp } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter(); // routerを使用
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // --- Googleログイン処理 ---
  const handleGoogleSignIn = async () => {
    if (!agreed) {
      toast({
        variant: "destructive",
        title: "同意が必要です",
        description: "利用規約とプライバシーポリシーに同意してください。",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 初期化して firebaseApp と auth を取得
      const { firebaseApp, auth: firebaseAuth } = initializeFirebase();

      if (!firebaseApp || !firebaseAuth) {
        throw new Error(
          "Firebaseの初期化に失敗しました。設定を確認してください。",
        );
      }

      const { GoogleAuthProvider, signInWithPopup } =
        await import("firebase/auth");
      const provider = new GoogleAuthProvider();

      // ログイン実行
      await signInWithPopup(firebaseAuth, provider);

      toast({
        title: "ログイン成功",
        description: "ダッシュボードへ移動します...",
      });

      // 確実に遷移させるため window.location を使用
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Googleログイン失敗",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  // --- メールアドレス登録処理 ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "認証システムを初期化できませんでした。",
      });
      return;
    }

    if (!agreed) {
      toast({
        variant: "destructive",
        title: "同意が必要です",
        description: "利用規約とプライバシーポリシーに同意してください。",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "パスワード不一致",
        description: "入力されたパスワードが一致しません。",
      });
      return;
    }

    setIsLoading(true);
    try {
      await initiateEmailSignUp(auth, formData.email, formData.password);
      toast({
        title: "登録成功",
        description: "アカウントが作成されました。",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration Error:", error);
      toast({
        variant: "destructive",
        title: "登録に失敗しました",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-primary p-2 rounded-lg text-white">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tight text-primary">
              カーチェックフロー
            </span>
          </Link>
          <h1 className="text-3xl font-headline font-bold">ショップ登録</h1>
          <p className="text-muted-foreground">
            今すぐ車両検査の自動化を始めましょう
          </p>
        </div>

        <Card className="border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              アカウントを作成する
            </CardTitle>
            <CardDescription>
              販売者として登録するには詳細を入力してください
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {/* GoogleアイコンのSVG部分はそのまま */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Googleで登録
            </Button>

            <div className="flex items-center gap-4 py-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                またはメールアドレスで登録
              </span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">電子メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="shop@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">パスワード（確認）</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-start space-x-3 pt-4">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none"
                  >
                    <Link
                      href="/terms"
                      className="text-primary hover:underline font-bold"
                    >
                      利用規約
                    </Link>
                    および
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline font-bold"
                    >
                      プライバシーポリシー
                    </Link>
                    に同意します。
                  </label>
                  <p className="text-xs text-muted-foreground">
                    AI 分析は 100% 正確ではないことを認識しています。
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-headline font-bold bg-primary py-6 mt-4"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                販売者アカウントを作成する
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <p className="text-sm text-center w-full text-muted-foreground">
              すでにアカウントをお持ちですか？{" "}
              <Link
                href="/login"
                className="text-primary font-bold hover:underline"
              >
                ログイン
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
