// ================================================================
// GRIT RECRUITING PLATFORM — COMPLETE BACKEND
// Single file: Core API + AI + Matching + Cold Email + Payments + Contracts
//
// STACK: Node.js / Express / Supabase / Anthropic / Stripe / DocuSign
// ================================================================

require("dotenv").config();

process.on('unhandledRejection', (err) => {
  console.error('[GRIT] Unhandled rejection (server kept alive):', err.message);
});
process.on('uncaughtException', (err) => {
  console.error('[GRIT] Uncaught exception (server kept alive):', err.message);
});

const express    = require("express");
const cors       = require("cors");
const nodemailer = require("nodemailer");
const Anthropic  = require("@anthropic-ai/sdk");
const stripe     = require("stripe")(process.env.STRIPE_SECRET_KEY);
const docusign   = require("docusign-esign");
const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require("uuid");

const app = express();

// ── Stripe webhook needs raw body BEFORE json middleware ──────────
app.use("/webhooks/stripe", express.raw({ type: "application/json" }));

// ── Standard middleware ───────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2mb" }));

// ── Service clients ───────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Supabase official client ──────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

// ================================================================
// CONFIGURATION
// ================================================================

const CONFIG = {
  PLACEMENT_FEE_PERCENT: 0.20,
  GUARANTEE_DAYS: 90,
  INVOICE_DUE_DAYS: 30,
  COMPANY_NAME: "GRIT Recruiting",
  SUPPORT_EMAIL: process.env.GMAIL_USER || "billing@gritrecruiting.com",
};

// ================================================================
// UTILITIES
// ================================================================

async function callClaude(prompt, maxTokens = 1200) {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  return msg.content.map((b) => b.text || "").join("");
}

function parseJSON(raw) {
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ================================================================
// HEALTH CHECK
// ================================================================

app.get("/", (req, res) => res.json({ status: "GRIT API running ✓", version: "2.0" }));

app.get("/health", async (req, res) => {
  try {
    const { data, error } = await supabase.from("candidates").select("id").limit(1);
    if (error) throw error;
    res.json({ status: "ok", supabase: "connected" });
  } catch (e) {
    res.status(503).json({ status: "degraded", supabase: "unreachable", error: e.message });
  }
});

// ================================================================
// AI ANALYSIS ROUTES
// ================================================================

app.post("/analyse", async (req, res) => {
  try {
    const { text, type } = req.body;
    const prompts = {
      cv: `Analyse this CV and return ONLY valid JSON (no markdown):
{"name":"","email":"","skills":[],"yearsExperience":0,"industries":[],"education":"","summary":"","seniorityLevel":""}
CV:\n${text}`,
      job: `Analyse this job description and return ONLY valid JSON (no markdown):
{"title":"","requiredSkills":[],"niceToHaveSkills":[],"minExperience":0,"maxExperience":0,"industry":"","seniorityLevel":"","summary":""}
JD:\n${text}`,
      interview: `Score this interview transcript and return ONLY valid JSON (no markdown):
{"score":0,"strengths":[],"concerns":[],"recommendation":"yes","summary":""}
Transcript:\n${text}`,
    };
    const raw = await callClaude(prompts[type] || prompts.cv, 1200);
    res.json(parseJSON(raw));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ================================================================
// CANDIDATE ROUTES
// ================================================================

app.get("/candidates", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    console.error("[GRIT] /candidates error:", e.message);
    res.status(503).json({ error: "Database unreachable", detail: e.message });
  }
});

app.post("/candidates", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("candidates")
      .insert([req.body])
      .select()
      .single();
    if (error) throw error;

    try {
      const { data: jobs } = await supabase.from("jobs").select("*");
      if (jobs?.length) {
        const matchRows = jobs.map((j) => {
          const s = computeMatchScore(data, j);
          return { candidate_id: data.id, job_id: j.id, total_score: s.total, breakdown: s.breakdown };
        });
        await supabase.from("matches").upsert(matchRows, { onConflict: "candidate_id,job_id" });
      }
    } catch (matchErr) {
      console.warn("[GRIT] Auto-match failed (non-fatal):", matchErr.message);
    }

    res.json(data);
  } catch (e) {
    console.error("[GRIT] POST /candidates error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ================================================================
// JOBS ROUTES
// ================================================================

app.get("/jobs", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    console.error("[GRIT] /jobs error:", e.message);
    res.status(503).json({ error: "Database unreachable", detail: e.message });
  }
});

app.post("/jobs", async (req, res) => {
  try {
    const { data: job, error } = await supabase
      .from("jobs")
      .insert([req.body])
      .select()
      .single();
    if (error) throw error;

    try {
      const { data: candidates } = await supabase.from("candidates").select("*");
      if (candidates?.length) {
        const matchRows = candidates.map((c) => {
          const s = computeMatchScore(c, job);
          return { candidate_id: c.id, job_id: job.id, total_score: s.total, breakdown: s.breakdown };
        });
        await supabase.from("matches").upsert(matchRows, { onConflict: "candidate_id,job_id" });
      }
    } catch (matchErr) {
      console.warn("[GRIT] Auto-match failed (non-fatal):", matchErr.message);
    }

    res.json(job);
  } catch (e) {
    console.error("[GRIT] POST /jobs error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ================================================================
// MATCHING ENGINE
// ================================================================

app.get("/matches/:jobId", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*, candidates(*)")
      .eq("job_id", req.params.jobId)
      .order("total_score", { ascending: false })
      .limit(10);
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    console.error("[GRIT] /matches error:", e.message);
    res.status(503).json({ error: "Database unreachable", detail: e.message });
  }
});

function computeMatchScore(candidate, job) {
  let score = 0;
  const breakdown = {};

  const cSkills    = (candidate.skills || []).map((s) => s.toLowerCase());
  const jSkills    = (job.required_skills || job.requiredSkills || []).map((s) => s.toLowerCase());
  const niceSkills = (job.nice_to_have_skills || job.niceToHaveSkills || []).map((s) => s.toLowerCase());
  const reqMatch   = jSkills.filter((s) => cSkills.includes(s)).length;
  const niceMatch  = niceSkills.filter((s) => cSkills.includes(s)).length;
  const sk = jSkills.length ? Math.min(35, Math.round((reqMatch / jSkills.length) * 35)) : 20;
  const bk = niceSkills.length ? Math.min(5, Math.round((niceMatch / niceSkills.length) * 5)) : 0;
  breakdown.skills = { score: sk + bk, max: 40 };
  score += sk + bk;

  const yrs  = candidate.years_experience || candidate.yearsExperience || 0;
  const minY = job.min_experience || job.minExperience || 0;
  const maxY = job.max_experience || job.maxExperience || 20;
  const ex   = yrs >= minY && yrs <= maxY ? 25 : yrs >= minY * 0.75 ? 18 : yrs >= minY * 0.5 ? 10 : 3;
  breakdown.experience = { score: ex, max: 25 };
  score += ex;

  const cI  = (candidate.industries || []).map((i) => i.toLowerCase());
  const jI  = (job.industry || "").toLowerCase();
  const ind = cI.includes(jI) ? 20 : cI.some((i) => i.includes(jI) || jI.includes(i)) ? 12 : 0;
  breakdown.industry = { score: ind, max: 20 };
  score += ind;

  const remote   = job.remote && (candidate.open_to_remote ?? candidate.openToRemote);
  const sameCity = (candidate.location || "").toLowerCase() === (job.location || "").toLowerCase();
  const loc      = remote ? 10 : sameCity ? 10 : (candidate.open_to_remote ?? candidate.openToRemote) ? 5 : 0;
  breakdown.location = { score: loc, max: 10 };
  score += loc;

  const intv = candidate.interview_score ? Math.round((candidate.interview_score / 100) * 5) : 0;
  breakdown.interview = { score: intv, max: 5 };
  score += intv;

  return { total: Math.min(100, score), breakdown };
}

// ================================================================
// COLD EMAIL / LEAD DISCOVERY
// ================================================================

app.post("/leads/discover", async (req, res) => {
  try {
    const { searchQuery, industry, role } = req.body;
    const raw = await callClaude(
      `Generate 6 realistic companies that are likely hiring for "${role}" roles in "${industry}". 
Search context: "${searchQuery}"
Return ONLY a valid JSON array (no markdown):
[{"company":"","website":"","industry":"","size":"startup|smb|enterprise","location":"",
"hiringContact":"","contactEmail":"","linkedinUrl":"","recentSignal":"","estimatedRoles":[]}]`,
      1800
    );
    const leads = parseJSON(raw);
    const { data, error } = await supabase
      .from("leads")
      .insert(leads.map((l) => ({ ...l, status: "new" })))
      .select();
    if (error) throw error;
    res.json(data);
  } catch (e) {
    console.error("[GRIT] /leads/discover error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/emails/generate", async (req, res) => {
  try {
    const { lead, emailType, topCandidate, senderName, senderTitle } = req.body;
    const prompts = {
      platform: `Write a short, natural cold email from ${senderName} (${senderTitle}) at GRIT to 
${lead.hiringContact || lead.hiring_contact} at ${lead.company}. 
Signal to reference naturally: ${lead.recentSignal || lead.recent_signal}. 
Company: ${lead.size} ${lead.industry} in ${lead.location}. 
4–6 sentences. Pitch GRIT AI recruitment platform. CTA: "Worth a 15-min call?". No filler.
Return ONLY JSON: {"subject":"","body":""}`,

      candidate: `Write a cold email from ${senderName} (${senderTitle}) at GRIT proposing a pre-vetted candidate 
to ${lead.hiringContact || lead.hiring_contact} at ${lead.company}. 
Candidate: ${topCandidate?.name}, ${topCandidate?.years_experience} yrs, ${topCandidate?.seniority_level}, 
skills: ${(topCandidate?.skills || []).slice(0, 4).join(", ")}. AI interview score: ${topCandidate?.interview_score || "—"}/100.
Signal: ${lead.recentSignal || lead.recent_signal}. 5–7 sentences. Lead with candidate value. Soft CTA.
Return ONLY JSON: {"subject":"","body":""}`,
    };

    const raw = await callClaude(prompts[emailType] || prompts.platform, 800);
    const email = parseJSON(raw);

    const { data, error } = await supabase
      .from("email_campaigns")
      .insert([{
        lead_id: lead.id,
        subject: email.subject,
        body: email.body,
        email_type: emailType,
        status: "draft",
        sender_name: senderName,
      }])
      .select()
      .single();
    if (error) throw error;

    res.json({ ...email, id: data.id });
  } catch (e) {
    console.error("[GRIT] /emails/generate error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/emails/send", async (req, res) => {
  try {
    const { to, subject, body, senderName, senderEmail, campaignId } = req.body;
    await mailer.sendMail({
      from: `"${senderName}" <${process.env.GMAIL_USER}>`,
      replyTo: senderEmail || process.env.GMAIL_USER,
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, "<br>"),
    });
    if (campaignId) {
      await supabase
        .from("email_campaigns")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", campaignId);
    }
    res.json({ success: true });
  } catch (e) {
    console.error("[GRIT] /emails/send error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get("/email-campaigns", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("email_campaigns")
      .select("*, leads(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    console.error("[GRIT] /email-campaigns error:", e.message);
    res.status(503).json({ error: "Database unreachable", detail: e.message });
  }
});

// ================================================================
// PAYMENT & CONTRACT SYSTEM
// ================================================================

app.post("/fee-calculator", (req, res) => {
  const { annualSalary } = req.body;
  if (!annualSalary || isNaN(annualSalary)) {
    return res.status(400).json({ error: "annualSalary is required" });
  }
  const fee = Math.round(Number(annualSalary) * CONFIG.PLACEMENT_FEE_PERCENT);
  res.json({
    annualSalary: Number(annualSalary),
    feePercent: CONFIG.PLACEMENT_FEE_PERCENT * 100,
    feeAmount: fee,
    feeSummary: `£${fee.toLocaleString()} placement fee (${CONFIG.PLACEMENT_FEE_PERCENT * 100}%)`,
  });
});

app.post("/placements", async (req, res) => {
  try {
    const {
      companyId, companyName, companyEmail, companySignerName,
      candidateId, candidateName, jobTitle,
      annualSalary, startDate,
    } = req.body;

    const feeAmount = Math.round(annualSalary * CONFIG.PLACEMENT_FEE_PERCENT);

    const placement = {
      id: uuidv4(),
      status: "CONTRACT_PENDING",
      company_id: companyId,
      company_name: companyName,
      company_email: companyEmail,
      candidate_id: candidateId,
      candidate_name: candidateName,
      job_title: jobTitle,
      annual_salary: annualSalary,
      fee_amount: feeAmount,
      start_date: startDate,
      guarantee_expires_at: addDays(new Date(startDate), CONFIG.GUARANTEE_DAYS).toISOString(),
      contract_signed_at: null,
      stripe_invoice_id: null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("placements").insert([placement]).select().single();
    if (error) throw error;

    await sendPlacementContract({
      placementId: data.id,
      companySignerName: companySignerName || companyEmail,
      companySignerEmail: companyEmail,
      companyName, candidateName, jobTitle, annualSalary, feeAmount, startDate,
    });

    res.status(201).json({
      success: true,
      placement: data,
      message: "Contract sent for signature. Invoice triggered on signing.",
    });
  } catch (e) {
    console.error("[GRIT] Placement creation error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get("/placements", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("placements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    console.error("[GRIT] /placements error:", e.message);
    res.status(503).json({ error: "Database unreachable", detail: e.message });
  }
});

app.get("/placements/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("placements")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (error) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/placements/:id/invoice", async (req, res) => {
  try {
    const { data: placement, error } = await supabase
      .from("placements")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (error) throw new Error("Placement not found");
    const invoice = await createAndSendStripeInvoice(placement);
    res.json({ success: true, invoiceId: invoice.id, invoiceUrl: invoice.hosted_invoice_url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ================================================================
// STRIPE INVOICE LOGIC
// ================================================================

async function createAndSendStripeInvoice(placement) {
  console.log("[GRIT] Starting Stripe invoice for:", placement.company_name);
  const { data: companyRec } = await supabase
    .from("companies")
    .select("stripe_customer_id")
    .eq("id", placement.company_id)
    .single();

  let stripeCustomerId = companyRec?.stripe_customer_id;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: placement.company_name,
      email: placement.company_email,
      metadata: { grit_company_id: placement.company_id || placement.id },
    });
    stripeCustomerId = customer.id;
    await supabase
      .from("companies")
      .upsert([{ id: placement.company_id || placement.id, stripe_customer_id: customer.id }]);
  }

  const invoice = await stripe.invoices.create({
    customer: stripeCustomerId,
    collection_method: "send_invoice",
    days_until_due: CONFIG.INVOICE_DUE_DAYS,
    currency: "gbp",
    description: `GRIT Recruiting – Placement Fee: ${placement.candidate_name} as ${placement.job_title}`,
    metadata: { placement_id: placement.id, candidate: placement.candidate_name },
    custom_fields: [
      { name: "Placement ID",    value: placement.id.slice(0, 20) },
      { name: "Candidate",       value: placement.candidate_name },
      { name: "Role",            value: placement.job_title },
      { name: "Start Date",      value: placement.start_date },
      { name: "Guarantee Until", value: placement.guarantee_expires_at?.split("T")[0] || "—" },
    ],
    footer: `Questions? ${CONFIG.SUPPORT_EMAIL} · ${CONFIG.GUARANTEE_DAYS}-day replacement guarantee.`,
  });

  await stripe.invoiceItems.create({
    customer: stripeCustomerId,
    invoice: invoice.id,
    amount: placement.fee_amount * 100,
    currency: "gbp",
    description: `Recruiting Fee – ${placement.job_title} (${CONFIG.PLACEMENT_FEE_PERCENT * 100}% of £${placement.annual_salary?.toLocaleString()})`,
  });

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id);

  try {
    await stripe.invoices.sendInvoice(invoice.id);
  } catch (sendErr) {
    console.warn("[GRIT] Invoice send skipped (test mode):", sendErr.message);
  }

  await supabase
    .from("placements")
    .update({ status: "INVOICE_SENT", stripe_invoice_id: invoice.id, stripe_invoice_url: finalized.hosted_invoice_url })
    .eq("id", placement.id);

  console.log(`[GRIT] Invoice created → ${placement.company_email} | £${placement.fee_amount}`);
  return finalized;
}

// ================================================================
// STRIPE WEBHOOK
// ================================================================

app.post("/webhooks/stripe", async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[GRIT] Stripe webhook signature failed:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  const invoice = event.data.object;
  const placementId = invoice.metadata?.placement_id;

  try {
    switch (event.type) {
      case "invoice.paid": {
        if (!placementId) break;
        await supabase.from("placements").update({
          status: "PAID",
          paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
          amount_paid: invoice.amount_paid / 100,
        }).eq("id", placementId);

        const { data: p } = await supabase.from("placements").select("*").eq("id", placementId).single();
        if (p) {
          await mailer.sendMail({
            from: `"GRIT Recruiting" <${process.env.GMAIL_USER}>`,
            to: p.company_email,
            subject: `✅ Payment Confirmed – ${p.candidate_name} Placement`,
            html: `<h2>Payment Received</h2><p>Hi ${p.company_name},</p>
<p>We've received your placement fee of <strong>£${p.fee_amount?.toLocaleString()}</strong> for 
<strong>${p.candidate_name}</strong> as <strong>${p.job_title}</strong>.</p>
<p>Your <strong>${CONFIG.GUARANTEE_DAYS}-day replacement guarantee</strong> is active until 
<strong>${p.guarantee_expires_at?.split("T")[0]}</strong>.</p>
<p>Thank you for choosing GRIT!</p>`,
          });
        }
        console.log(`[GRIT] ✅ PAID: placement ${placementId}`);
        break;
      }
      case "invoice.payment_failed": {
        if (!placementId) break;
        await supabase.from("placements").update({ status: "PAYMENT_FAILED" }).eq("id", placementId);
        await mailer.sendMail({
          from: process.env.GMAIL_USER,
          to: CONFIG.SUPPORT_EMAIL,
          subject: `⚠️ PAYMENT FAILED – Placement ${placementId}`,
          html: `<p>Payment failed for placement <strong>${placementId}</strong>. Follow up immediately.</p>`,
        });
        break;
      }
      case "invoice.overdue":
      case "invoice.payment_action_required": {
        if (!placementId) break;
        await supabase.from("placements").update({ status: "OVERDUE" }).eq("id", placementId);
        break;
      }
    }
  } catch (e) {
    console.error("[GRIT] Stripe webhook handler error:", e.message);
  }

  res.json({ received: true });
});

// ================================================================
// DOCUSIGN
// ================================================================

async function sendPlacementContract({
  placementId, companySignerName, companySignerEmail,
  companyName, candidateName, jobTitle, annualSalary, feeAmount, startDate,
}) {
  if (!process.env.DOCUSIGN_ACCESS_TOKEN || !process.env.DOCUSIGN_ACCOUNT_ID) {
    console.warn("[GRIT] DocuSign not configured — skipping contract send (dev mode)");
    await supabase.from("placements").update({ status: "CONTRACT_SKIPPED_DEV" }).eq("id", placementId);
    const { data: p } = await supabase.from("placements").select("*").eq("id", placementId).single();
    if (p && process.env.STRIPE_SECRET_KEY) await createAndSendStripeInvoice(p);
    return;
  }

  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(process.env.DOCUSIGN_BASE_URL || "https://na4.docusign.net/restapi");
  apiClient.addDefaultHeader("Authorization", `Bearer ${process.env.DOCUSIGN_ACCESS_TOKEN}`);

  const envelopesApi        = new docusign.EnvelopesApi(apiClient);
  const envelopeDefn        = new docusign.EnvelopeDefinition();
  envelopeDefn.emailSubject = `GRIT Recruiting – Fee Agreement: ${candidateName}`;
  envelopeDefn.status       = "sent";

  const contractHtml = generateContractHTML({
    companyName, candidateName, jobTitle, annualSalary, feeAmount, startDate, placementId,
  });

  const doc           = new docusign.Document();
  doc.documentBase64  = Buffer.from(contractHtml).toString("base64");
  doc.name            = `GRIT_Agreement_${candidateName.replace(/\s+/g, "_")}.html`;
  doc.fileExtension   = "html";
  doc.documentId      = "1";
  envelopeDefn.documents = [doc];

  const signer        = new docusign.Signer();
  signer.name         = companySignerName;
  signer.email        = companySignerEmail;
  signer.recipientId  = "1";
  signer.routingOrder = "1";

  const signHere      = new docusign.SignHere();
  signHere.documentId = "1";
  signHere.pageNumber = "1";
  signHere.xPosition  = "100";
  signHere.yPosition  = "700";

  const tabs          = new docusign.Tabs();
  tabs.signHereTabs   = [signHere];
  signer.tabs         = tabs;

  envelopeDefn.recipients         = new docusign.Recipients();
  envelopeDefn.recipients.signers = [signer];

  const result = await envelopesApi.createEnvelope(
    process.env.DOCUSIGN_ACCOUNT_ID,
    { envelopeDefinition: envelopeDefn }
  );

  await supabase
    .from("placements")
    .update({ status: "CONTRACT_SENT", docusign_envelope_id: result.envelopeId })
    .eq("id", placementId);

  console.log(`[GRIT] Contract sent → ${companySignerEmail} | Envelope: ${result.envelopeId}`);
}

// ================================================================
// DOCUSIGN WEBHOOK
// ================================================================

app.post("/webhooks/docusign", async (req, res) => {
  try {
    const { envelopeId, status } = req.body;
    if (status === "completed" && envelopeId) {
      const { data: placement } = await supabase
        .from("placements")
        .select("*")
        .eq("docusign_envelope_id", envelopeId)
        .single();

      if (placement) {
        await supabase
          .from("placements")
          .update({ status: "CONTRACT_SIGNED", contract_signed_at: new Date().toISOString() })
          .eq("id", placement.id);

        await createAndSendStripeInvoice(placement);
      }
    }
    res.json({ received: true });
  } catch (e) {
    console.error("[GRIT] DocuSign webhook error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ================================================================
// CONTRACT HTML TEMPLATE
// ================================================================

function generateContractHTML({ companyName, candidateName, jobTitle, annualSalary, feeAmount, startDate, placementId }) {
  const feePercent = Math.round((feeAmount / annualSalary) * 100);
  const today = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html><html><head><style>
body{font-family:Arial,sans-serif;font-size:11pt;margin:60px;color:#1a1a1a;line-height:1.6}
h1{font-size:18pt;text-align:center}h2{font-size:13pt;margin-top:24px}
.meta{text-align:center;color:#555;margin-bottom:32px}
.party{background:#f8f8f8;padding:12px 16px;border-radius:4px;margin:8px 0}
table{width:100%;border-collapse:collapse;margin:16px 0}
td,th{border:1px solid #ddd;padding:8px 12px}th{background:#1a1a1a;color:white}
.sig{margin-top:60px;border-top:1px solid #ccc;padding-top:24px}
.pid{font-size:8pt;color:#aaa;text-align:center;margin-top:40px}
</style></head><body>
<h1>GRIT RECRUITING — PLACEMENT FEE AGREEMENT</h1>
<p class="meta">Executed ${today} | Placement ID: ${placementId}</p>
<h2>1. PARTIES</h2>
<div class="party"><strong>Recruiter:</strong> GRIT Recruiting</div>
<div class="party"><strong>Client:</strong> ${companyName}</div>
<h2>2. PLACEMENT DETAILS</h2>
<table><tr><th>Field</th><th>Detail</th></tr>
<tr><td>Candidate</td><td>${candidateName}</td></tr>
<tr><td>Role</td><td>${jobTitle}</td></tr>
<tr><td>Annual Salary</td><td>£${Number(annualSalary).toLocaleString()}</td></tr>
<tr><td>Start Date</td><td>${startDate}</td></tr></table>
<h2>3. FEE</h2>
<p>Client agrees to pay GRIT <strong>${feePercent}% of first-year base salary = £${Number(feeAmount).toLocaleString()}</strong>, 
due within 30 days of candidate's first day. A Stripe invoice will be issued upon execution.</p>
<h2>4. REPLACEMENT GUARANTEE</h2>
<p>If candidate resigns or is terminated for cause within ${CONFIG.GUARANTEE_DAYS} days of start, 
GRIT will conduct one replacement search at no additional fee, provided the original fee was paid in full.</p>
<h2>5. LATE PAYMENT</h2>
<p>Invoices unpaid after 30 days accrue interest at 1.5%/month. Client is liable for collection costs.</p>
<h2>6. CONFIDENTIALITY & NON-SOLICITATION</h2>
<p>Terms are confidential. Client agrees not to solicit other GRIT-introduced candidates for 12 months without consent.</p>
<h2>7. GOVERNING LAW</h2>
<p>This Agreement is governed by the laws of England and Wales. Disputes resolved by binding arbitration.</p>
<div class="sig"><h2>8. SIGNATURES</h2>
<p>By signing, Client agrees to all terms above.</p><br><br>
<strong>Authorized Signatory — ${companyName}:</strong><br><br>
Signature: ___________________________ &nbsp;&nbsp; Date: ___________________<br><br>
<strong>GRIT Recruiting:</strong> Pre-authorized electronically.</div>
<p class="pid">Placement ID: ${placementId}</p>
</body></html>`;
}

// ================================================================
// START SERVER
// ================================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────────┐
  │   GRIT Platform API  →  port ${PORT}          │
  │   Core routes:   /candidates  /jobs          │
  │   Matching:      /matches/:jobId             │
  │   Outreach:      /leads/discover             │
  │   Payments:      /placements  /fee-calculator│
  │   Webhooks:      /webhooks/stripe  /docusign │
  └─────────────────────────────────────────────┘
  `);
});
