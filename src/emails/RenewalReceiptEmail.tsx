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
  renewalDate: string;
  nextRenewalDate: string;
  appUrl: string;
};

export default function RenewalReceiptEmail({ familyName, renewalDate, nextRenewalDate, appUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Renouvellement HomeBudget PRO confirmé — merci !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Renouvellement PRO confirmé ✓</Heading>
          <Text style={text}>
            Le renouvellement de l'abonnement PRO du foyer <strong>{familyName}</strong> a bien
            été traité le <strong>{renewalDate}</strong>.
          </Text>
          <Text style={text}>
            Votre accès à toutes les fonctionnalités PRO continue sans interruption.
            Prochain renouvellement : <strong>{nextRenewalDate}</strong>.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`${appUrl}/dashboard`}>
              Accéder à mon tableau de bord
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Retrouvez vos factures dans les{" "}
            <a href={`${appUrl}/settings`} style={{ color: "#94a3b8" }}>paramètres</a>{" "}
            de votre compte.
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
  backgroundColor: "#f59e0b",
  color: "#000",
  padding: "12px 24px",
  borderRadius: "12px",
  fontWeight: "600",
  fontSize: "14px",
  textDecoration: "none",
};
const hr = { borderColor: "#1e293b", margin: "24px 0" };
const footer = { color: "#475569", fontSize: "12px" };
