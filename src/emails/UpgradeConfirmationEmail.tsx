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
  appUrl: string;
};

export default function UpgradeConfirmationEmail({ familyName, renewalDate, appUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Votre abonnement HomeBudget PRO est activé !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bienvenue dans HomeBudget PRO ✨</Heading>
          <Text style={text}>
            L'abonnement PRO du foyer <strong>{familyName}</strong> est maintenant actif.
          </Text>
          <Text style={text}>
            Vous bénéficiez désormais de :<br />
            • Fiches mensuelles illimitées<br />
            • Actifs, dettes et objectifs illimités<br />
            • Déclaration 2042 avec extraction IA<br />
            • Calcul du quotient familial et de l'IR<br />
            • Comparaison N-1
          </Text>
          <Text style={text}>
            Prochain renouvellement : <strong>{renewalDate}</strong>
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`${appUrl}/dashboard`}>
              Découvrir les fonctionnalités PRO
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Gérez votre abonnement depuis les{" "}
            <a href={`${appUrl}/settings`} style={{ color: "#94a3b8" }}>paramètres</a>.
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
