import * as React from 'react'
import { Button, Heading, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { BRAND, BrandLayout, styles } from './_brand'

interface Props {
  vendorName?: string
  planName?: string
  amountVnd?: number
  transferCode?: string
  adminUrl?: string
}

const formatVnd = (n?: number) =>
  typeof n === 'number' ? `${n.toLocaleString('vi-VN')}đ` : '—'

const Email = ({
  vendorName = 'Vendor',
  planName = 'Gói',
  amountVnd,
  transferCode,
  adminUrl = `${BRAND.url}/admin/payments`,
}: Props) => (
  <BrandLayout preview={`Thanh toán mới chờ duyệt từ ${vendorName}`}>
    <Heading style={styles.h1}>Thanh toán mới chờ duyệt</Heading>
    <Text style={styles.text}>
      Có một vendor vừa gửi yêu cầu duyệt thanh toán cho gói dịch vụ.
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
        <strong>Vendor:</strong> {vendorName}
      </Text>
      <Text style={{ ...styles.text, margin: '0 0 6px' }}>
        <strong>Gói:</strong> {planName}
      </Text>
      <Text style={{ ...styles.text, margin: '0 0 6px' }}>
        <strong>Số tiền:</strong> {formatVnd(amountVnd)}
      </Text>
      {transferCode && (
        <Text style={{ ...styles.text, margin: '0' }}>
          <strong>Mã chuyển khoản:</strong> {transferCode}
        </Text>
      )}
    </Section>
    <Button href={adminUrl} style={styles.button}>
      Vào trang duyệt
    </Button>
  </BrandLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Thanh toán mới chờ duyệt — ${d?.vendorName ?? 'Vendor'} (Mariée)`,
  displayName: 'Admin — Payment chờ duyệt',
  previewData: {
    vendorName: 'Studio Mariée',
    planName: 'Featured 3 tháng',
    amountVnd: 1_500_000,
    transferCode: 'MARIEE-123',
  },
} satisfies TemplateEntry