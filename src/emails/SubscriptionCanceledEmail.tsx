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
  accessUntil: string;
  appUrl: string;
};

export default function SubscriptionCanceledEmail({ familyName, accessUntil, appUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Votre abonnement HomeBudget PRO a été résilié</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Abonnement PRO résilié</Heading>
          <Text style={text}>
            L'abonnement PRO du foyer <strong>{familyName}</strong> a été résilié.
          </Text>
          <Text style={text}>
            Vous conservez un accès complet aux fonctionnalités PRO jusqu'au{" "}
            <strong>{accessUntil}</strong>. Passé cette date, votre compte passera
            automatiquement au plan gratuit. Vos données seront conservées.
          </Text>
          <Text style={text}>
            Si vous avez résilié par erreur ou souhaitez vous réabonner :
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`${appUrl}/settings`}>
              Réactiver mon abonnement PRO
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Merci d'avoir utilisé HomeBudget. Vos données restent accessibles en mode gratuit.
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
const buttonContainer = { textAlign: "center" as const, margin: "24px 0" };
const button = {
  backgroundColor: "#1e293b",
  color: "#f8fafc",
  padding: "12px 24px",
  borderRadius: "12px",
  fontWeight: "600",
  fontSize: "14px",
  textDecoration: "none",
  border: "1px solid #334155",
};
const hr = { borderColor: "#1e293b", margin: "24px 0" };
const footer = { color: "#475569", fontSize: "12px" };
