import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import { BrandLayout, styles } from './_brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <BrandLayout preview="Bạn được mời tham gia Mariée">
    <Heading style={styles.h1}>Bạn được mời tham gia Mariée</Heading>
    <Text style={styles.text}>
      Bạn vừa được mời tham gia nền tảng <strong>Mariée</strong> — nơi tạo
      trang lễ cưới sang trọng và quản lý dịch vụ cưới. Nhấn nút bên dưới để
      chấp nhận lời mời và thiết lập tài khoản.
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Chấp nhận lời mời
    </Button>
    <Text style={{ ...styles.text, fontSize: '13px', color: '#7a5a60' }}>
      Nếu bạn không mong đợi lời mời này, có thể bỏ qua email một cách an toàn.
    </Text>
  </BrandLayout>
)

export default InviteEmail
