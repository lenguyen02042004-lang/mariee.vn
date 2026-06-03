import * as React from 'react'
import { Button, Link, Text } from '@react-email/components'
import { BrandLayout, styles } from './_brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <BrandLayout preview="Xác minh email để bắt đầu hành trình cùng Mariée">
    <Text style={{ ...styles.text, fontStyle: 'italic', color: '#b8345a' }}>
      Chào mừng bạn đến với Mariée.
    </Text>
    <Text style={styles.text}>
      Cảm ơn bạn đã tạo tài khoản. Để hoàn tất đăng ký và bắt đầu xây dựng
      trang lễ cưới của riêng mình, vui lòng xác minh địa chỉ email{' '}
      <Link href={`mailto:${recipient}`} style={styles.link}>
        {recipient}
      </Link>
      .
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Xác minh email
    </Button>
    <Text style={{ ...styles.text, fontSize: '13px', color: '#7a5a60' }}>
      Nếu bạn không tạo tài khoản này, bạn có thể bỏ qua email này một cách an toàn.
    </Text>
  </BrandLayout>
)

export default SignupEmail
