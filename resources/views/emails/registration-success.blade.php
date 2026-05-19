@php
    $resolvedFirstName = is_string($firstName ?? null) && trim($firstName) !== '' ? trim($firstName) : 'there';
    $resolvedAccountType = is_string($accountType ?? null) && trim($accountType) !== '' ? trim($accountType) : 'customer';
    $resolvedCtaUrl = is_string($ctaUrl ?? null) && trim($ctaUrl) !== '' ? trim($ctaUrl) : '/';
    $embeddedLogo = null;

    if (isset($message) && is_string($logoPath ?? null) && is_file($logoPath)) {
        $embeddedLogo = $message->embed($logoPath);
    }
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Welcome to FoodOnlines.com</title>
    <style>
        @media only screen and (max-width: 640px) {
            .email-shell {
                width: 100% !important;
            }

            .email-card {
                padding: 32px 20px !important;
            }

            .email-headline {
                font-size: 32px !important;
                line-height: 38px !important;
            }

            .email-copy,
            .email-footer {
                font-size: 16px !important;
                line-height: 28px !important;
            }

            .email-button,
            .email-button tbody,
            .email-button tr,
            .email-button td {
                width: 100% !important;
            }

            .email-button a {
                box-sizing: border-box !important;
                display: block !important;
                width: 100% !important;
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
        }
    </style>
</head>
<body style="margin:0; padding:0; background-color:#f5f7f4; color:#111111;">
    <span style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden;">
        Thank you for signing up with FoodOnlines.com. Your {{ $resolvedAccountType }} account is ready.
    </span>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f5f7f4; margin:0; padding:0; width:100%;">
        <tr>
            <td align="center" style="padding:24px 12px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-shell" style="width:600px; max-width:600px;">
                    <tr>
                        <td class="email-card" style="background-color:#ffffff; border:1px solid #e7ece4; border-radius:24px; padding:40px 48px; font-family:Arial, Helvetica, sans-serif;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom:24px;">
                                        @if ($embeddedLogo)
                                            <img src="{{ $embeddedLogo }}" alt="FoodOnlines.com" width="280" style="display:block; width:100%; max-width:280px; height:auto; border:0;">
                                        @else
                                            <div style="font-size:28px; font-weight:700; color:#60b526; line-height:34px;">
                                                Food<span style="color:#ff6b00;">Onlines</span><span style="color:#111111;">.com</span>
                                            </div>
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom:12px;">
                                        <div style="display:inline-block; min-width:52px; border-radius:999px; background-color:#eff9e8; color:#60b526; font-size:30px; line-height:52px; text-align:center; font-weight:700;">
                                            &#10003;
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" class="email-headline" style="padding-bottom:16px; font-size:40px; line-height:46px; font-weight:800; color:#111111;">
                                        Thank You for Signing Up!
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" class="email-copy" style="padding-bottom:12px; font-size:18px; line-height:30px; color:#202020;">
                                        Hi {{ $resolvedFirstName }},
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" class="email-copy" style="padding-bottom:18px; font-size:18px; line-height:30px; color:#202020;">
                                        Thank you for signing up with FoodOnlines.com.<br>
                                        Your account has been successfully created.
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom:10px; font-size:28px; line-height:34px; font-weight:800; color:#111111;">
                                        What&rsquo;s next?
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" class="email-copy" style="padding-bottom:28px; font-size:18px; line-height:30px; color:#202020;">
                                        Explore our platform and discover 1000s of food supplies from trusted suppliers near you.
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom:32px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="email-button">
                                            <tr>
                                                <td align="center" style="border-radius:14px;">
                                                    <!--[if mso]>
                                                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ $resolvedCtaUrl }}" style="height:60px;v-text-anchor:middle;width:420px;" arcsize="12%" strokecolor="#60b526" fillcolor="#60b526">
                                                        <w:anchorlock/>
                                                        <center style="color:#ffffff;font-family:Arial, Helvetica, sans-serif;font-size:20px;font-weight:700;">
                                                            1000s of Food Supplies to Start Here
                                                        </center>
                                                    </v:roundrect>
                                                    <![endif]-->
                                                    <!--[if !mso]><!-->
                                                    <a href="{{ $resolvedCtaUrl }}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:18px 28px; border-radius:14px; background-color:#60b526; font-family:Arial, Helvetica, sans-serif; font-size:20px; line-height:24px; font-weight:700; color:#ffffff; text-decoration:none;">
                                                        1000s of Food Supplies to Start Here
                                                    </a>
                                                    <!--<![endif]-->
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top:24px; border-top:1px solid #e7ece4;" class="email-footer">
                                        <div style="font-size:13px; line-height:22px; color:#5f655d; text-align:center;">
                                            You are receiving this email because you signed up for an account at FoodOnlines.com.<br>
                                            You can unsubscribe to opt out.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
