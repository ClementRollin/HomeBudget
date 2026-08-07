/* eslint-disable react/no-unescaped-entities */
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Props = {
  userName: string;
  familyName: string;
  appUrl: string;
};

export default function WelcomeEmail({ userName, familyName, appUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur HomeBudget, {userName} !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bienvenue sur HomeBudget 🎉</Heading>
          <Text style={text}>
            Bonjour {userName},
          </Text>
          <Text style={text}>
            Votre compte a bien été créé et votre foyer <strong>{familyName}</strong> est prêt.
            Vous pouvez dès maintenant commencer à suivre votre budget mensuel, votre patrimoine
            et votre situation fiscale.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`${appUrl}/dashboard`}>
              Accéder à mon tableau de bord
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            En utilisant HomeBudget, vous acceptez nos{" "}
            <Link href={`${appUrl}/legal/cgu`}>Conditions Générales d'Utilisation</Link>
            {" "}et notre{" "}
            <Link href={`${appUrl}/legal/confidentialite`}>Politique de confidentialité</Link>.
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
const footer = { color: "#475569", fontSize: "12px", lineHeight: "20px" };
