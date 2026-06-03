import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import { BrandLayout, styles } from './_brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <BrandLayout preview="Liên kết đăng nhập Mariée của bạn">
    <Heading style={styles.h1}>Đăng nhập vào Mariée</Heading>
    <Text style={styles.text}>
      Nhấn nút bên dưới để đăng nhập an toàn vào tài khoản của bạn. Liên kết
      này sẽ hết hạn trong vài phút.
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Đăng nhập ngay
    </Button>
    <Text style={{ ...styles.text, fontSize: '13px', color: '#7a5a60' }}>
      Nếu bạn không yêu cầu liên kết này, vui lòng bỏ qua email.
    </Text>
  </BrandLayout>
)

export default MagicLinkEmail
