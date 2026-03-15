import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Page Not Found
            </h1>
            <p className="text-muted-foreground">
              We couldn't find the page you were looking for. It might have been moved or deleted.
            </p>
          </div>

          <Button asChild size="lg" className="w-full rounded-xl">
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
