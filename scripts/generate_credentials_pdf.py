import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.units import inch

def generate_pdf():
    pdf_path = os.path.abspath("public/NAMH-ASTRO-TEST-CREDENTIALS.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom brand colors
    c_purple = colors.HexColor("#351044")
    c_dark_purple = colors.HexColor("#240A2E")
    c_gold = colors.HexColor("#D4A84F")
    c_gold_light = colors.HexColor("#FFF8E7")
    c_bg_light = colors.HexColor("#FAF7FC")
    c_gray_border = colors.HexColor("#E5DCEB")
    c_muted = colors.HexColor("#6A5575")

    # Typography styles
    style_brand = ParagraphStyle(
        'BrandTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=c_purple
    )

    style_sub = ParagraphStyle(
        'BrandSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=c_muted
    )

    style_badge = ParagraphStyle(
        'BadgeText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#F8D677"),
        alignment=2
    )

    style_h2 = ParagraphStyle(
        'Heading2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=c_purple,
        spaceBefore=8,
        spaceAfter=4
    )

    style_body = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#222222")
    )

    style_code = ParagraphStyle(
        'Code',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8.5,
        leading=11,
        textColor=c_purple
    )

    story = []

    # 1. Header with Logo & Title
    header_data = [
        [
            Paragraph("<b>NAMH ASTRO</b>", style_brand),
            Paragraph("<b>CLIENT UAT & TESTING DOSSIER</b><br/><font color='#DDD'>Release v1.0 · Live Production</font>", style_badge)
        ],
        [
            Paragraph("Vedic Astrology Marketplace & Enterprise Consultation Engine", style_sub),
            Paragraph("<font color='#DDD'>Domain: namhastro.com</font>", style_badge)
        ]
    ]
    t_header = Table(header_data, colWidths=[330, 190])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BACKGROUND', (1,0), (1,-1), c_purple),
        ('CORNERPAD', (1,0), (1,-1), 4),
        ('RIGHTPADDING', (1,0), (1,-1), 10),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_gold, spaceAfter=8))

    # 2. Highlight Banner: Live URLs & App Download
    banner_data = [
        [
            Paragraph("<b>🌐 Official Live Production Website:</b>", style_body),
            Paragraph("<font color='#351044'><b>https://namhastro.com</b></font>", style_code)
        ],
        [
            Paragraph("<b>📲 Android Mobile App (.APK) Direct Download:</b>", style_body),
            Paragraph("<font color='#15803D'><b>https://namhastro.com/namhastro.apk</b> (6.26 MB)</font>", style_code)
        ],
        [
            Paragraph("<b>📄 Testing Dossier PDF Link:</b>", style_body),
            Paragraph("<font color='#351044'><b>https://namhastro.com/NAMH-ASTRO-TEST-CREDENTIALS.pdf</b></font>", style_code)
        ]
    ]
    t_banner = Table(banner_data, colWidths=[230, 290])
    t_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_gold_light),
        ('BOX', (0,0), (-1,-1), 1, c_gold),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_banner)
    story.append(Spacer(1, 10))

    # 3. Section: Customer / Devotee Portal
    story.append(Paragraph("<b>1. Devotee & Customer Account Portal</b> — URL: <b>https://namhastro.com/account</b>", style_h2))
    cust_data = [
        ["Testing Method", "Credentials & Actions", "Expected Result"],
        [
            "⚡ 1-Click Demo Login",
            "Click gold button '⚡ 1-Click Instant Demo Login' on /account",
            "Instant access to Aarav Sharma's dashboard with ₹150 balance"
        ],
        [
            "Mobile OTP Login",
            "Phone: +91 9988776655 (or any number)\nOTP Code: 123456",
            "Creates verified devotee session, loads wallet and profile"
        ],
        [
            "Email / Password",
            "Email: devotee@namhastro.com\nPassword: NamhAstro@2026",
            "Authenticated session with full profile editing"
        ],
        [
            "Vedic Birth Profiles",
            "Click '+ Add Birth Profile' in 'Birth Profiles' tab",
            "Adds new family member chart; saved in database & browser"
        ],
        [
            "Wallet & Recharge",
            "URL: https://namhastro.com/account/wallet",
            "Shows ₹150 balance, packages ₹100, ₹250, ₹500 (+bonus)"
        ],
        [
            "Customer Support",
            "Click '+ Submit Support Ticket' in 'Customer Support' tab",
            "Generates ticket (e.g. NAMH-TKT-101), saved on server"
        ]
    ]
    t_cust = Table(cust_data, colWidths=[120, 220, 180])
    t_cust.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_purple),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, c_gray_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('FONTSIZE', (0,1), (-1,-1), 8),
    ]))
    story.append(t_cust)
    story.append(Spacer(1, 10))

    # 4. Section: Astrologer & Vendor Portal
    story.append(Paragraph("<b>2. Astrologer & Vendor Partner Portal</b> — URL: <b>https://namhastro.com/partner</b>", style_h2))
    ast_data = [
        ["Portal Feature", "Testing Input & Details", "Expected Behavior"],
        [
            "📝 Vendor Registration",
            "Click '📝 Vendor Registration Form' toggle at top.\nFill Name, Phone, Exp Years, Specialities, UPI/PAN",
            "Submits without login block. Saves to server api/data/partner_applications.json and unlocks active console."
        ],
        [
            "🔮 Astrologer Console",
            "Click '🔮 Astrologer Console' toggle at top.\nAstrologer: Acharya Someshwar Shastri",
            "Displays live status (ONLINE/BUSY), consultation requests queue, and WebRTC call launcher."
        ],
        [
            "Service Rates",
            "Chat: ₹30/min · Audio: ₹35/min · Video: ₹50/min",
            "Per-minute rate cards locked for incoming seeker calls."
        ],
        [
            "Earnings & Payout",
            "Gross: ₹18,500.00 · Commission (20%): ₹3,700.00\nWithdrawable: ₹14,800.00 (Bank: HDFC Bank Verified)",
            "Click 'Withdraw Funds' to open instant bank transfer modal."
        ]
    ]
    t_ast = Table(ast_data, colWidths=[120, 220, 180])
    t_ast.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_purple),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, c_gray_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('FONTSIZE', (0,1), (-1,-1), 8),
    ]))
    story.append(t_ast)
    story.append(Spacer(1, 10))

    # 5. Section: Super Admin Workspace
    story.append(Paragraph("<b>3. Super Admin Enterprise Workspace (36 Modules)</b> — URL: <b>https://namhastro.com/admin</b>", style_h2))
    admin_data = [
        ["Module / Area", "Credentials & Navigation", "Features Available to Audit"],
        [
            "Admin Credentials",
            "Email: admin@namhastro.com\nPassword: NamhAstro@Admin2026\nRole: Super Administrator",
            "Full read/write control across all platform microservices, commissions, and customer records."
        ],
        [
            "CRM & Live Consultations",
            "Navigate to 'Customer CRM' or 'Live Operations'",
            "Devotee 360° timeline, active audio/video rooms, customer wallet credits, and astrologer queues."
        ],
        [
            "Finance, Wallets & PnL",
            "Navigate to 'Revenue & PnL', 'Wallets', 'Settlements'",
            "Platform gross/net margins, GST invoicing, commission splits (default 20%), bank transfers."
        ],
        [
            "Verification & Disputes",
            "Navigate to 'Verification' or 'Complaints & Disputes'",
            "Approve/reject astrologer KYC, issue customer refunds with 1-click resolution audit trail."
        ]
    ]
    t_admin = Table(admin_data, colWidths=[120, 220, 180])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_purple),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, c_gray_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('FONTSIZE', (0,1), (-1,-1), 8),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 10))

    # 6. Android App Installation Guide
    story.append(Paragraph("<b>4. Android App (.APK) Installation Instructions</b>", style_h2))
    apk_steps = [
        ["Step", "Action", "Notes"],
        ["1. Download", "Tap https://namhastro.com/namhastro.apk on Android Chrome", "File size: 6.26 MB. Browser downloads namhastro.apk"],
        ["2. Install", "Tap downloaded notification or open Downloads > namhastro.apk", "If prompted, allow 'Install unknown apps' for Chrome"],
        ["3. Permissions", "Open NAMH ASTRO app and grant Camera & Microphone permissions", "Enables real-time WebRTC video and audio consultations with astrologers"],
        ["4. Live Updates", "Any website update reflects automatically in the app", "Engineered with native Capacitor Web-Bridge + auto-sync engine"]
    ]
    t_apk = Table(apk_steps, colWidths=[70, 270, 180])
    t_apk.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_purple),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, c_gray_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('FONTSIZE', (0,1), (-1,-1), 8),
    ]))
    story.append(t_apk)
    story.append(Spacer(1, 12))

    # 7. Footer
    story.append(HRFlowable(width="100%", thickness=0.8, color=c_gray_border, spaceAfter=4))
    footer_text = Paragraph(
        "<font color='#777'>NAMH ASTRO Platform Handover Dossier · Confidential Client Document · Generated November 2026 · https://namhastro.com</font>",
        style_sub
    )
    story.append(footer_text)

    doc.build(story)
    print(f"Successfully generated PDF at: {pdf_path}")

if __name__ == '__main__':
    generate_pdf()
