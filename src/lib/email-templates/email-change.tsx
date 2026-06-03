import * as React from 'react'
import { Button, Heading, Link, Text } from '@react-email/components'
import { BrandLayout, styles } from './_brand'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <BrandLayout preview="Xác nhận thay đổi email Mariée">
    <Heading style={styles.h1}>Xác nhận thay đổi email</Heading>
    <Text style={styles.text}>
      Bạn đã yêu cầu thay đổi địa chỉ email từ{' '}
      <Link href={`mailto:${oldEmail}`} style={styles.link}>
        {oldEmail}
      </Link>{' '}
      sang{' '}
      <Link href={`mailto:${newEmail}`} style={styles.link}>
        {newEmail}
      </Link>
      .
    </Text>
    <Text style={styles.text}>Nhấn nút bên dưới để xác nhận thay đổi:</Text>
    <Button style={styles.button} href={confirmationUrl}>
      Xác nhận email mới
    </Button>
    <Text style={{ ...styles.text, fontSize: '13px', color: '#7a5a60' }}>
      Nếu bạn không yêu cầu thay đổi này, vui lòng đổi mật khẩu để bảo vệ tài
      khoản ngay lập tức.
    </Text>
  </BrandLayout>
)

export default EmailChangeEmail
