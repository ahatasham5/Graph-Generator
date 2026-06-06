# GraphForge - মাল্টি-লাইন গ্রাফ জেনারেটর

GraphForge একটি ওয়েব অ্যাপ। Excel বা Google Sheets থেকে X, Y ডেটা কপি করে পেস্ট করলেই সুন্দর মাল্টি-লাইন গ্রাফ তৈরি করা যায়।

## প্রথমবার ইনস্টল

Windows-এ প্রথমবার শুধু এই ফাইলটি ডাবল-ক্লিক করুন:

```text
install-graphforge.bat
```

ইনস্টলার যা করবে:

- Python 3.8-3.12, 64-bit আছে কি না চেক করবে।
- Python না থাকলে `winget` দিয়ে Python 3.11, 64-bit ইনস্টল করার চেষ্টা করবে।
- `backend\.venv` নামে এই কম্পিউটারের জন্য আলাদা virtual environment তৈরি করবে।
- `backend\requirements.txt` থেকে backend dependency ইনস্টল করবে।
- Desktop-এ `GraphForge` shortcut তৈরি করবে।

ইনস্টল শেষ হলে Desktop-এর **GraphForge** আইকনে ডাবল-ক্লিক করলেই অ্যাপ চালু হবে।

## প্রতিবার চালানোর নিয়ম

1. Desktop-এর **GraphForge** আইকনে ডাবল-ক্লিক করুন।
2. Backend এবং Frontend-এর জন্য দুটি command window খুলবে।
3. Browser-এ `http://127.0.0.1:3001` খুলবে।
4. অ্যাপ ব্যবহার করার সময় ওই দুটি command window খোলা রাখুন।

## ম্যানুয়ালভাবে চালাতে চাইলে

ইনস্টল করার পরে চাইলে আলাদা করে চালানো যায়:

1. `start-backend.bat` ডাবল-ক্লিক করুন।
2. `start-frontend.bat` ডাবল-ক্লিক করুন।
3. Browser-এ `http://127.0.0.1:3001` খুলুন।

## কীভাবে ব্যবহার করবেন

1. Excel বা Google Sheets থেকে X, Y column কপি করুন।
2. GraphForge-এর text area-তে পেস্ট করুন।
3. দরকার হলে **+ Add Series** দিয়ে আরও line যোগ করুন।
4. **Rename** বা color picker দিয়ে line customize করুন।
5. **Generate Graph** ক্লিক করুন।
6. PNG বা SVG হিসেবে graph download করুন।

## গুরুত্বপূর্ণ নোট

- `backend\venv` বা `backend\.venv` অন্য কম্পিউটারে copy করে ব্যবহার করবেন না।
- প্রতিটি user-এর কম্পিউটারে `install-graphforge.bat` চালিয়ে নতুন `.venv` তৈরি করতে হবে।
- Dependency install করার সময় internet দরকার হতে পারে।
- Offline install দরকার হলে `wheels` folder তৈরি করে package wheel ফাইল রাখুন; installer থাকলে সেখান থেকেই dependency install করার চেষ্টা করবে।

## প্রয়োজনীয়তা

- Windows 10 বা Windows 11
- প্রথমবার install করার সময় internet connection
- Python 3.8-3.12, 64-bit; Python 3.11 recommended
- Python না থাকলে installer `winget` দিয়ে Python 3.11 ইনস্টল করার চেষ্টা করবে
