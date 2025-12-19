import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PetStatus {
  mood: string;
  message: string;
  emoji: string;
}

interface PetProps {
  pet?: PetStatus;
}

const moodColors: Record<string, string> = {
  HAPPY: "bg-green-100 dark:bg-green-900/30 border-green-500",
  NEUTRAL: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500",
  ANGRY: "bg-orange-100 dark:bg-orange-900/30 border-orange-500",
  SICK: "bg-red-100 dark:bg-red-900/30 border-red-500",
};

const moodAnimations: Record<string, string> = {
  HAPPY: "animate-bounce",
  NEUTRAL: "",
  ANGRY: "animate-pulse",
  SICK: "animate-pulse",
};

export function Pet({ pet }: PetProps) {
  const mood = pet?.mood || "NEUTRAL";
  const emoji = pet?.emoji || "😐";
  const message = pet?.message || "Waiting for data...";

  return (
    <Card className={`border-2 ${moodColors[mood] || moodColors.NEUTRAL}`}>
      <CardHeader>
        <CardTitle className="text-center">Pet Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div
          className={`text-8xl ${moodAnimations[mood] || ""}`}
          role="img"
          aria-label={`Pet mood: ${mood}`}
        >
          {emoji}
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-foreground">{mood}</div>
          <div className="text-muted-foreground">{message}</div>
        </div>
      </CardContent>
    </Card>
  );
}
