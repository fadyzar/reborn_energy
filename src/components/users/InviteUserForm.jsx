import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Send, Copy, Check, Link as LinkIcon, PartyPopper, Mail, Loader2 } from "lucide-react";
import { SendEmail } from "@/api/integrations";

export default function InviteUserForm({ onClose, coachId }) {
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const generateLink = () => {
    const inviteLink = `${window.location.origin}/?coach_id=${coachId}`;
    setGeneratedLink(inviteLink);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInviteEmail = async () => {
    if (!email.trim()) {
      alert('יש להכניס כתובת מייל תקינה');
      return;
    }

    setSending(true);
    try {
      await SendEmail({
        to: email.trim(),
        subject: '🎯 הזמנה למערכת מעקב התזונה Reborn Energy',
        body: `שלום!

הוזמנת להצטרף למערכת מעקב התזונה החכמה Reborn Energy! 🚀

💪 מה מחכה לך:
• מעקב חכם אחר התזונה היומית שלך
• מטרות אישיות מותאמות בדיוק עבורך  
• אנליטיקה מתקדמת להתקדמות שלך
• ליווי צמוד ומקצועי מהמאמן שלך
• קהילה תומכת ומוטיבציה משותפת

🔗 להתחלה, לחץ על הקישור הבא:
${generatedLink}

⏰ הקישור תקף לתמיד ותוכל להשתמש בו בכל עת.

לאחר ההרשמה, תקבל גישה מיידית לכל הכלים והפיצ'רים שיעזרו לך להגיע ליעדים שלך!

בהצלחה,
צוות Reborn Energy 💚`
      });
      
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('שגיאה בשליחת המייל. נסה שוב.');
    }
    setSending(false);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-blue-500" />
          יצירת קישור הזמנה
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!generatedLink ? (
          <>
            <Alert>
              <PartyPopper className="h-4 w-4" />
              <AlertDescription>
                צור קישור הזמנה ייחודי ושלח אותו למתאמן חדש. כשהוא יירשם דרך הקישור, הוא ישויך אליך אוטומטית.
              </AlertDescription>
            </Alert>
            <Button
              onClick={generateLink}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500"
            >
              <Send className="w-4 h-4 ml-2" />
              צור קישור
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <Alert variant="success">
              <Check className="h-4 w-4" />
              <AlertDescription>
                הקישור נוצר בהצלחה! בחר איך לשלוח אותו למתאמן.
              </AlertDescription>
            </Alert>
            
            {/* Link Display and Copy */}
            <div className="space-y-2">
              <Label htmlFor="invite-link">קישור הזמנה</Label>
              <div className="flex gap-2">
                <Input id="invite-link" readOnly value={generatedLink} dir="ltr" className="text-sm" />
                <Button type="button" variant="secondary" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Email Option */}
            <div className="border-t pt-4 space-y-3">
              <Label htmlFor="trainee-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                שליחה במייל (אופציונאלי)
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="trainee-email"
                  type="email" 
                  placeholder="דוא״ל של המתאמן החדש..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={sendInviteEmail}
                  disabled={!email.trim() || sending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {emailSent && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    המייל נשלח בהצלחה! המתאמן יקבל הודעה עם ההוראות.
                  </AlertDescription>
                </Alert>
              )}
              
              <p className="text-xs text-gray-500">
                המערכת תשלח הודעת הזמנה מקצועית עם הסבר מפורט והקישור
              </p>
            </div>
            
            <p className="text-sm text-gray-600">
              ניתן להשתמש בקישור זה מספר פעמים להזמנת מתאמנים נוספים.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          <X className="w-4 h-4 ml-2" />
          סגור
        </Button>
        {generatedLink && (
           <Button type="button" onClick={() => {
             setGeneratedLink('');
             setEmail('');
             setEmailSent(false);
           }}>
            צור קישור חדש
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}