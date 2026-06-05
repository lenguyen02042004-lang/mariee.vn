import * as React from 'react'
import { Button, Heading, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { BRAND, BrandLayout, styles } from './_brand'

interface Props {
  coupleName?: string
  guestName?: string
  attending?: boolean
  numGuests?: number
  side?: string
  message?: string
  rsvpUrl?: string
}

const sideLabel: Record<string, string> = {
  bride: 'Khách cô dâu',
  groom: 'Khách chú rể',
  both: 'Khách chung',
}

const Email = ({
  coupleName = 'Cô dâu chú rể',
  guestName = 'Khách mời',
  attending = true,
  numGuests = 1,
  side,
  message,
  rsvpUrl = `${BRAND.url}/couple/rsvp`,
}: Props) => (
  <BrandLayout preview={`${guestName} vừa xác nhận tham dự`}>
    <Heading style={styles.h1}>Bạn có xác nhận RSVP mới</Heading>
    <Text style={styles.text}>
      Chào {coupleName}, vừa có một khách mời gửi xác nhận tham dự lễ cưới của bạn.
    </Text>
    <Section
      style={{
        backgroundColor: BRAND.cream,
        border: `1px solid ${BRAND.border}`,
        borderRadius: '8px',
        padding: '18px 22px',
        margin: '8px 0 22px',
      }}
    >
      <Text style={{ ...styles.text, margin: '0 0 6px' }}>
        <strong>Khách:</strong> {guestName}
      </Text>
      <Text style={{ ...styles.text, margin: '0 0 6px' }}>
        <strong>Tham dự:</strong>{' '}
        {attending ? `Có (${numGuests} người)` : 'Rất tiếc không thể tham dự'}
      </Text>
      {side && (
        <Text style={{ ...styles.text, margin: '0 0 6px' }}>
          <strong>Bên:</strong> {sideLabel[side] ?? side}
        </Text>
      )}
      {message && (
        <Text style={{ ...styles.text, margin: '8px 0 0', whiteSpace: 'pre-line' }}>
          “{message}”
        </Text>
      )}
    </Section>
    <Button href={rsvpUrl} style={styles.button}>
      Xem danh sách RSVP
    </Button>
  </BrandLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `${d?.guestName ?? 'Khách mời'} vừa xác nhận tham dự — Mariée`,
  displayName: 'Couple — RSVP mới',
  previewData: {
    coupleName: 'An & Bình',
    guestName: 'Phương Anh',
    attending: true,
    numGuests: 2,
    side: 'bride',
    message: 'Chúc hai bạn trăm năm hạnh phúc!',
  },
} satisfies TemplateEntry