# 🎨 How to Use AI Features in Artvinci

## ✨ AI Art Analysis - Step by Step

### **Setup (One-time only):**
1. Get your FREE Gemini API key: https://makersuite.google.com/app/apikey
2. Add to `Artvinci-backend/.env`:
   ```
   GEMINI_API_KEY=your-actual-key-here
   ```
3. Restart Django server (Ctrl+C, then `python manage.py runserver`)

---

## 🎨 **3 Ways to Use AI:**

### **1. ✨ Analyze with AI** (Full Image Analysis)

**For NEW artworks:**
1. Go to **Dashboard → My Artworks → Create Artwork**
2. Enter a **title** (required!)
3. Upload your artwork image
4. Click **"✨ Analyze with AI"** button
5. AI will:
   - Save the artwork as draft
   - Upload the image
   - Analyze and auto-fill:
     - ✅ Tags (10-15 relevant tags)
     - ✅ Description (compelling description)
     - ✅ Medium/Technique
     - ✅ Show style, colors, mood, price suggestion

**For EXISTING artworks:**
1. Go to **My Artworks → Edit** (artwork with image)
2. Click **"✨ Analyze with AI"** button
3. AI instantly analyzes and fills the form!

---

### **2. 🏷️ AI Generate Tags**

**Quick tag generation from text:**
1. Enter artwork **title**
2. (Optional) Add description
3. Click **"🏷️ AI Generate"** next to Tags field
4. AI generates 10 relevant search tags instantly!

**Example:**
```
Title: "Sunset Over Mountains"
Description: "A peaceful landscape"
→ AI generates: landscape, sunset, mountains, nature, peaceful, orange sky, scenic, wall art, home decor, calming
```

---

### **3. ✍️ AI Enhance Description**

**Make descriptions more compelling:**
1. Enter artwork **title**
2. (Optional) Write a basic description
3. Click **"✍️ AI Enhance"** button
4. AI rewrites it professionally!

**Example:**
```
Before: "A colorful abstract painting"
After: "This mesmerizing abstract composition bursts with vibrant energy, featuring bold brushstrokes and dynamic color interplay that invites viewers to explore their own emotional landscape."
```

---

## 🎯 **What AI Detects:**

When you use **"✨ Analyze with AI"**, you get:

```json
✅ Style: "Abstract Expressionism", "Realism", etc.
✅ Colors: ["Cobalt Blue", "Golden Yellow", "Crimson Red"]
✅ Mood: "Energetic and Dynamic", "Peaceful", "Melancholic"
✅ Subject: "Portrait", "Landscape", "Abstract Forms"
✅ Tags: 10-15 relevant keywords
✅ Description: Professional, SEO-friendly text
✅ Technique: "Oil on Canvas", "Digital Art", etc.
✅ Price Suggestion: "$500-$1000", "$1000+"
✅ Complexity: "Low", "Medium", "High"
```

---

## 💡 **Pro Tips:**

### For Best Results:
- ✅ Use **high-quality images** (clear, well-lit)
- ✅ Enter a **descriptive title** before AI generation
- ✅ Review AI suggestions (you can edit them!)
- ✅ Use AI for **inspiration**, not replacement

### Workflow Suggestion:
1. Upload image
2. Enter title & category
3. Click **"✨ Analyze with AI"**
4. Review auto-filled tags & description
5. Adjust pricing based on AI suggestion
6. Save & publish!

---

## 🆓 **Cost & Limits:**

**FREE Tier (No credit card!):**
- ✅ 60 requests per minute
- ✅ 1,500 requests per day
- ✅ Perfect for small-medium platforms

**What counts as 1 request:**
- ✨ Analyze with AI = 1 request
- 🏷️ Generate Tags = 1 request
- ✍️ Enhance Description = 1 request

**1,500/day = ~50 artworks analyzed per day!**

---

## ❓ **Troubleshooting:**

### **"AI analysis failed" error:**
- ✅ Check if `GEMINI_API_KEY` is set in `.env`
- ✅ Restart Django server after adding key
- ✅ Make sure you have internet connection

### **"Please enter a title first" error:**
- ✅ For new artworks, AI needs a title to create draft
- ✅ Just type any title before clicking AI buttons

### **Cloudinary upload errors:**
- ✅ Don't worry! Just save artwork first
- ✅ Then edit and use AI analysis
- ✅ AI works best on saved artworks

### **AI generates generic results:**
- ✅ Use clearer, higher quality images
- ✅ Try with different artwork types
- ✅ Make sure lighting is good in photo

---

## 🎨 **Example Workflow:**

```
1. Click "Create Artwork"
2. Title: "Urban Dreams at Dusk"
3. Upload: [city skyline photo]
4. Click "✨ Analyze with AI"
   
   → AI fills:
   - Tags: urban, cityscape, dusk, modern, architecture, blue hour, skyline, contemporary, wall art, office decor
   - Description: "Urban Dreams at Dusk captures the ethereal beauty of city life as day transitions to night, with sweeping architectural lines and warm golden light..."
   - Medium: Digital Photography
   - Suggested Price: $300-$700

5. Set price: $500
6. Add dimensions: 24x36 inches
7. Click "Create Artwork"
8. Published! 🎉
```

---

## 🚀 **Benefits:**

**For Artists:**
- ⏱️ **Save 10+ minutes** per artwork
- 🎯 **Better SEO** = more visibility
- ✍️ **Professional descriptions** instantly
- 💰 **Pricing guidance** from AI

**For Your Platform:**
- 🔍 **Better search results** (accurate tags)
- 📈 **Higher conversion** (compelling descriptions)
- ⚡ **Unique feature** (competitor advantage)
- 🎨 **Consistent quality** across listings

---

## 📚 **Need More Help?**

- **Backend API Docs:** See `AI_FEATURES.md`
- **Test Script:** Run `python test_ai_features.py`
- **Gemini Docs:** https://ai.google.dev/docs

**Ready to create amazing artwork listings with AI?** 🎨✨
