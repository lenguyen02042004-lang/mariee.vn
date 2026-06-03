import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export const BRAND = {
  name: 'Mariée',
  tagline: 'Trang lễ cưới sang trọng cho những cặp đôi',
  primary: '#b8345a',
  primaryDeep: '#8a1f3f',
  gold: '#c9a96e',
  cream: '#fdf8f6',
  ink: '#3d1f24',
  muted: '#7a5a60',
  border: '#efe1e4',
  url: 'https://mariee.vn',
}

export const styles = {
  main: {
    backgroundColor: '#ffffff',
    fontFamily: 'Georgia, "Cormorant Garamond", "Times New Roman", serif',
    color: BRAND.ink,
    margin: 0,
    padding: 0,
  } as React.CSSProperties,
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '0',
    backgroundColor: '#ffffff',
  } as React.CSSProperties,
  header: {
    backgroundColor: BRAND.cream,
    padding: '32px 32px 24px',
    textAlign: 'center' as const,
    borderBottom: `2px solid ${BRAND.border}`,
  } as React.CSSProperties,
  brandMark: {
    fontFamily: '"Great Vibes", "Allura", "Brush Script MT", cursive',
    fontSize: '40px',
    color: BRAND.primary,
    margin: '0',
    lineHeight: 1,
  } as React.CSSProperties,
  brandSub: {
    fontSize: '11px',
    letterSpacing: '0.25em',
    textTransform: 'uppercase' as const,
    color: BRAND.muted,
    margin: '6px 0 0',
    fontFamily: 'Arial, sans-serif',
  } as React.CSSProperties,
  inner: { padding: '32px' } as React.CSSProperties,
  h1: {
    fontFamily: 'Georgia, "Cormorant Garamond", serif',
    fontSize: '26px',
    fontWeight: 600 as const,
    color: BRAND.ink,
    margin: '0 0 18px',
    lineHeight: 1.2,
  } as React.CSSProperties,
  text: {
    fontSize: '15px',
    color: BRAND.ink,
    lineHeight: 1.65,
    margin: '0 0 18px',
    fontFamily: 'Georgia, serif',
  } as React.CSSProperties,
  button: {
    display: 'inline-block',
    backgroundColor: BRAND.primary,
    color: '#ffffff',
    fontSize: '13px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 600 as const,
    borderRadius: '6px',
    padding: '14px 32px',
    textDecoration: 'none',
    margin: '8px 0 24px',
  } as React.CSSProperties,
  link: { color: BRAND.primaryDeep, textDecoration: 'underline' } as React.CSSProperties,
  code: {
    display: 'inline-block',
    backgroundColor: BRAND.cream,
    border: `1px solid ${BRAND.border}`,
    borderRadius: '8px',
    padding: '18px 28px',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '28px',
    letterSpacing: '0.4em',
    color: BRAND.primaryDeep,
    fontWeight: 700 as const,
    margin: '8px 0 24px',
  } as React.CSSProperties,
  hr: {
    borderTop: `1px solid ${BRAND.border}`,
    margin: '24px 0',
  } as React.CSSProperties,
  footer: {
    backgroundColor: BRAND.cream,
    padding: '24px 32px',
    textAlign: 'center' as const,
    fontSize: '12px',
    color: BRAND.muted,
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.6,
  } as React.CSSProperties,
  small: { fontSize: '12px', color: BRAND.muted, margin: '0' } as React.CSSProperties,
}

export function BrandLayout({
  preview,
  children,
}: {
  preview: string
  children: React.ReactNode
}) {
  return (
    <Html lang="vi" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading as="h1" style={styles.brandMark}>
              Mariée
            </Heading>
            <Text style={styles.brandSub}>{BRAND.tagline}</Text>
          </Section>
          <Section style={styles.inner}>{children}</Section>
          <Hr style={{ ...styles.hr, margin: 0 }} />
          <Section style={styles.footer}>
            <Text style={styles.small}>
              © {new Date().getFullYear()} Mariée — mariee.vn
            </Text>
            <Text style={{ ...styles.small, marginTop: '6px' }}>
              Bạn nhận được email này vì có tài khoản liên kết với địa chỉ này.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}