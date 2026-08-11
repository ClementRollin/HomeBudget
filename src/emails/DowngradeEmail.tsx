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
  appUrl: string;
};

export default function DowngradeEmail({ familyName, appUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Votre foyer {familyName} est repassé au plan gratuit</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Retour au plan gratuit</Heading>
          <Text style={text}>
            L'abonnement PRO du foyer <strong>{familyName}</strong> est arrivé à terme.
            Votre compte est maintenant sur le plan gratuit.
          </Text>
          <Text style={text}>
            Vos données sont intégralement conservées. Vous pouvez continuer à utiliser
            HomeBudget gratuitement avec les fonctionnalités de base.
          </Text>
          <Text style={text}>
            Pour retrouver l'accès à toutes les fonctionnalités PRO (fiches illimitées,
            extraction IA, calcul fiscal), réactivez votre abonnement à tout moment.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`${appUrl}/settings`}>
              Réactiver mon abonnement PRO
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Merci d'avoir utilisé HomeBudget PRO. Vos données restent en sécurité.
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
