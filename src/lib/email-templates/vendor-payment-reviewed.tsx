import * as React from 'react'
import { Button, Heading, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { BRAND, BrandLayout, styles } from './_brand'

interface Props {
  vendorName?: string
  planName?: string
  amountVnd?: number
  approved?: boolean
  expiresAt?: string
  adminNote?: string
  billingUrl?: string
}

const formatVnd = (n?: number) =>
  typeof n === 'number' ? `${n.toLocaleString('vi-VN')}đ` : '—'

const Email = ({
  vendorName = 'Bạn',
  planName = 'Gói',
  amountVnd,
  approved = true,
  expiresAt,
  adminNote,
  billingUrl = `${BRAND.url}/vendor/billing`,
}: Props) => (
  <BrandLayout
    preview={
      approved
        ? `Thanh toán của bạn đã được duyệt`
        : `Thanh toán của bạn chưa được duyệt`
    }
  >
    <Heading style={styles.h1}>
      {approved ? 'Thanh toán đã được duyệt' : 'Thanh toán chưa được duyệt'}
    </Heading>
    <Text style={styles.text}>
      Chào {vendorName},{' '}
      {approved
        ? 'thanh toán của bạn đã được Mariée xác nhận. Gói dịch vụ đã được kích hoạt.'
        : 'rất tiếc thanh toán của bạn chưa được duyệt. Vui lòng kiểm tra ghi chú bên dưới.'}
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
        <strong>Gói:</strong> {planName}
      </Text>
      <Text style={{ ...styles.text, margin: '0 0 6px' }}>
        <strong>Số tiền:</strong> {formatVnd(amountVnd)}
      </Text>
      {approved && expiresAt && (
        <Text style={{ ...styles.text, margin: '0' }}>
          <strong>Hiệu lực đến:</strong> {expiresAt}
        </Text>
      )}
      {!approved && adminNote && (
        <Text style={{ ...styles.text, margin: '8px 0 0', whiteSpace: 'pre-line' }}>
          <strong>Ghi chú:</strong> {adminNote}
        </Text>
      )}
    </Section>
    <Button href={billingUrl} style={styles.button}>
      Xem trạng thái thanh toán
    </Button>
  </BrandLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    d?.approved
      ? 'Thanh toán của bạn đã được duyệt — Mariée'
      : 'Thanh toán của bạn chưa được duyệt — Mariée',
  displayName: 'Vendor — Payment đã review',
  previewData: {
    vendorName: 'Studio Mariée',
    planName: 'Featured 3 tháng',
    amountVnd: 1_500_000,
    approved: true,
    expiresAt: '01/03/2027',
  },
} satisfies TemplateEntry