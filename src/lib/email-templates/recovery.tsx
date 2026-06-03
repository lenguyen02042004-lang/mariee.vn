import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import { BrandLayout, styles } from './_brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <BrandLayout preview="Đặt lại mật khẩu Mariée">
    <Heading style={styles.h1}>Đặt lại mật khẩu</Heading>
    <Text style={styles.text}>
      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Mariée của
      bạn. Nhấn nút bên dưới để chọn mật khẩu mới.
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Đặt lại mật khẩu
    </Button>
    <Text style={{ ...styles.text, fontSize: '13px', color: '#7a5a60' }}>
      Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này — mật
      khẩu hiện tại của bạn vẫn được giữ nguyên.
    </Text>
  </BrandLayout>
)

export default RecoveryEmail
