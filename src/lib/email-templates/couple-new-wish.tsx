import * as React from 'react'
import { Button, Heading, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { BRAND, BrandLayout, styles } from './_brand'

interface Props {
  coupleName?: string
  guestName?: string
  message?: string
  pageUrl?: string
}

const Email = ({
  coupleName = 'Cô dâu chú rể',
  guestName = 'Khách mời',
  message = '',
  pageUrl = BRAND.url,
}: Props) => (
  <BrandLayout preview={`${guestName} vừa gửi lời chúc đến bạn`}>
    <Heading style={styles.h1}>Bạn có một lời chúc mới</Heading>
    <Text style={styles.text}>
      Chào {coupleName}, {guestName} vừa gửi cho bạn một lời chúc trên trang cưới Mariée.
    </Text>
    <Section
      style={{
        backgroundColor: BRAND.cream,
        border: `1px solid ${BRAND.border}`,
        borderRadius: '8px',
        padding: '20px 24px',
        margin: '8px 0 22px',
      }}
    >
      <Text
        style={{
          ...styles.text,
          fontStyle: 'italic',
          margin: '0',
          whiteSpace: 'pre-line',
        }}
      >
        “{message}”
      </Text>
      <Text style={{ ...styles.small, marginTop: '12px', textAlign: 'right' }}>
        — {guestName}
      </Text>
    </Section>
    <Button href={pageUrl} style={styles.button}>
      Mở trang cưới
    </Button>
  </BrandLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Lời chúc mới từ ${d?.guestName ?? 'khách mời'} — Mariée`,
  displayName: 'Couple — Lời chúc mới',
  previewData: {
    coupleName: 'An & Bình',
    guestName: 'Minh Hà',
    message: 'Chúc hai bạn luôn hạnh phúc và yêu thương nhau trọn đời!',
  },
} satisfies TemplateEntry