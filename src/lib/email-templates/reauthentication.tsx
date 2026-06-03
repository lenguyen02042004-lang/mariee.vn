import * as React from 'react'
import { Heading, Text } from '@react-email/components'
import { BrandLayout, styles } from './_brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <BrandLayout preview="Mã xác minh Mariée của bạn">
    <Heading style={styles.h1}>Xác minh danh tính</Heading>
    <Text style={styles.text}>
      Sử dụng mã bên dưới để xác minh danh tính của bạn:
    </Text>
    <Text style={styles.code}>{token}</Text>
    <Text style={{ ...styles.text, fontSize: '13px', color: '#7a5a60' }}>
      Mã này sẽ hết hạn trong vài phút. Nếu bạn không yêu cầu, hãy bỏ qua email
      này.
    </Text>
  </BrandLayout>
)

export default ReauthenticationEmail
