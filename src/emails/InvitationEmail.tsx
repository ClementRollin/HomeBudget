/* eslint-disable react/no-unescaped-entities */
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Props = {
  familyName: string;
  inviterName: string;
  inviteCode: string;
  appUrl: string;
  expiresAt: string | null;
};

export default function InvitationEmail({ familyName, inviterName, inviteCode, appUrl, expiresAt }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{inviterName} vous invite à rejoindre le foyer {familyName} sur HomeBudget</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Vous êtes invité à rejoindre {familyName}</Heading>
          <Text style={text}>
            <strong>{inviterName}</strong> vous invite à rejoindre le foyer{" "}
            <strong>{familyName}</strong> sur HomeBudget pour gérer ensemble votre budget,
            votre patrimoine et votre situation fiscale.
          </Text>
          <Text style={text}>
            Votre code d'invitation :
          </Text>
          <Section style={codeContainer}>
            <Text style={codeText}>{inviteCode}</Text>
          </Section>
          {expiresAt && (
            <Text style={textMuted}>
              Ce code est valable jusqu'au <strong>{expiresAt}</strong>.
            </Text>
          )}
          <Section style={buttonContainer}>
            <Button style={button} href={`${appUrl}/auth/register?mode=join&code=${inviteCode}`}>
              Rejoindre le foyer
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Si vous n'attendiez pas cette invitation, ignorez simplement cet email.
            Aucun compte ne sera créé sans votre action.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#0f172a", fontFamily: "Arial, sans-serif" };
const container = { maxWidth: "520px", margin: "0 auto", padding: "40px 24px" };
const h1 = { color: "#f8fafc", fontSize: "24px", fontWeight: "700", margin: "0 0 16px" };
const text = { color: "#94a3b8", fontSize: "15px", lineHeight: "24px", margin: "0 0 12px" };
const textMuted = { color: "#64748b", fontSize: "14px", lineHeight: "22px", margin: "0 0 16px" };
const codeContainer = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "12px",
  padding: "16px",
  textAlign: "center" as const,
  margin: "16px 0",
};
const codeText = {
  color: "#f8fafc",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "6px",
  fontFamily: "monospace",
  margin: "0",
};
const buttonContainer = { textAlign: "center" as const, margin: "24px 0" };
const button = {
  backgroundColor: "#f59e0b",
  color: "#000",
  padding: "12px 24px",
  borderRadius: "12px",
  fontWeight: "600",
  fontSize: "14px",
  textDecoration: "none",
};
const hr = { borderColor: "#1e293b", margin: "24px 0" };
const footer = { color: "#475569", fontSize: "12px", lineHeight: "20px" };
