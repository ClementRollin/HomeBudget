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
  portalUrl: string;
};

export default function PaymentFailedEmail({ familyName, portalUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Action requise : paiement HomeBudget PRO échoué</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Paiement échoué ⚠️</Heading>
          <Text style={text}>
            Le renouvellement de l'abonnement PRO du foyer <strong>{familyName}</strong> a échoué.
          </Text>
          <Text style={text}>
            Votre accès PRO reste actif pendant une période de grâce de 7 jours. Passé ce délai,
            votre compte sera automatiquement rétrogradé au plan gratuit.
          </Text>
          <Text style={text}>
            Pour mettre à jour votre moyen de paiement, cliquez ci-dessous :
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={portalUrl}>
              Mettre à jour mon moyen de paiement
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Si vous avez des questions, contactez-nous à contact@[VOTRE-DOMAINE].
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
  backgroundColor: "#dc2626",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "12px",
  fontWeight: "600",
  fontSize: "14px",
  textDecoration: "none",
};
const hr = { borderColor: "#1e293b", margin: "24px 0" };
const footer = { color: "#475569", fontSize: "12px" };
