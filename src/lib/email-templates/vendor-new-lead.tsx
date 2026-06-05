import * as React from 'react'
import { Button, Heading, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { BRAND, BrandLayout, styles } from './_brand'

interface Props {
  vendorName?: string
  guestName?: string
  guestPhone?: string
  guestEmail?: string
  eventDate?: string
  message?: string
  leadsUrl?: string
}

const Email = ({
  vendorName = 'Bạn',
  guestName = 'Khách hàng',
  guestPhone,
  guestEmail,
  eventDate,
  message,
  leadsUrl = `${BRAND.url}/vendor/leads`,
}: Props) => (
  <BrandLayout preview={`Yêu cầu tư vấn mới từ ${guestName}`}>
    <Heading style={styles.h1}>Bạn có yêu cầu tư vấn mới</Heading>
    <Text style={styles.text}>
      Chào {vendorName}, vừa có một khách hàng quan tâm đến dịch vụ của bạn trên Mariée.
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
      {guestPhone && (
        <Text style={{ ...styles.text, margin: '0 0 6px' }}>
          <strong>SĐT:</strong> {guestPhone}
        </Text>
      )}
      {guestEmail && (
        <Text style={{ ...styles.text, margin: '0 0 6px' }}>
          <strong>Email:</strong> {guestEmail}
        </Text>
      )}
      {eventDate && (
        <Text style={{ ...styles.text, margin: '0 0 6px' }}>
          <strong>Ngày sự kiện:</strong> {eventDate}
        </Text>
      )}
      {message && (
        <Text style={{ ...styles.text, margin: '8px 0 0', whiteSpace: 'pre-line' }}>
          {message}
        </Text>
      )}
    </Section>
    <Text style={styles.text}>
      Hãy phản hồi sớm để tăng tỷ lệ chốt đơn nhé.
    </Text>
    <Button href={leadsUrl} style={styles.button}>
      Xem chi tiết
    </Button>
  </BrandLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Yêu cầu tư vấn mới từ ${d?.guestName ?? 'khách hàng'} — Mariée`,
  displayName: 'Vendor — Lead mới',
  previewData: {
    vendorName: 'Studio Mariée',
    guestName: 'Nguyễn Lan',
    guestPhone: '0901 234 567',
    guestEmail: 'lan@example.com',
    eventDate: '15/12/2026',
    message: 'Mình quan tâm gói chụp ảnh cưới ngoại cảnh.',
  },
} satisfies TemplateEntry