# 🚀 Deploy to GitHub Pages - Quick Setup Script
# Run this in PowerShell

Write-Host "🎰 Baccarat Prediction - GitHub Deployment Script" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
$gitVersion = git --version 2>$null
if (-not $gitVersion) {
    Write-Host "❌ Git chưa được cài đặt!" -ForegroundColor Red
    Write-Host "Download tại: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit
}

Write-Host "✅ Git đã cài: $gitVersion" -ForegroundColor Green
Write-Host ""

# Get GitHub username
$username = Read-Host "Nhập GitHub Username của bạn"
if (-not $username) {
    Write-Host "❌ Username không được để trống!" -ForegroundColor Red
    exit
}

# Get repository name
$repoName = Read-Host "Nhập Repository name (mặc định: Baccarat-Prediction)"
if (-not $repoName) {
    $repoName = "Baccarat-Prediction"
}

Write-Host ""
Write-Host "📋 Thông tin deploy:" -ForegroundColor Yellow
Write-Host "   Username: $username" -ForegroundColor White
Write-Host "   Repo: $repoName" -ForegroundColor White
Write-Host "   URL: https://github.com/$username/$repoName" -ForegroundColor White
Write-Host "   Website: https://$username.github.io/$repoName/" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "Tiếp tục? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Đã hủy." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔧 Bắt đầu deploy..." -ForegroundColor Cyan

# Initialize git if not exists
if (-not (Test-Path ".git")) {
    Write-Host "📦 Khởi tạo Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Đã khởi tạo Git" -ForegroundColor Green
}

# Add all files
Write-Host "📁 Thêm files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "💾 Commit changes..." -ForegroundColor Yellow
git commit -m "🎰 Deploy Baccarat Prediction System to GitHub Pages"

# Set main branch
Write-Host "🌿 Đổi branch sang main..." -ForegroundColor Yellow
git branch -M main

# Add remote
$remoteUrl = "https://github.com/$username/$repoName.git"
Write-Host "🔗 Thêm remote repository..." -ForegroundColor Yellow

$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "⚠️  Remote đã tồn tại, đang update..." -ForegroundColor Yellow
    git remote set-url origin $remoteUrl
} else {
    git remote add origin $remoteUrl
}

Write-Host "✅ Đã thêm remote: $remoteUrl" -ForegroundColor Green

# Push to GitHub
Write-Host ""
Write-Host "🚀 Đang push lên GitHub..." -ForegroundColor Cyan
Write-Host "⚠️  Nếu hỏi password, dùng Personal Access Token!" -ForegroundColor Yellow
Write-Host "   Tạo token tại: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Deploy thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Tiếp theo:" -ForegroundColor Cyan
    Write-Host "   1. Vào: https://github.com/$username/$repoName/settings/pages" -ForegroundColor White
    Write-Host "   2. Source → Chọn 'main' branch" -ForegroundColor White
    Write-Host "   3. Click Save" -ForegroundColor White
    Write-Host "   4. Đợi 1-2 phút" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Website sẽ có tại:" -ForegroundColor Green
    Write-Host "   https://$username.github.io/$repoName/" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Có lỗi xảy ra!" -ForegroundColor Red
    Write-Host "Kiểm tra:" -ForegroundColor Yellow
    Write-Host "   - Đã tạo repository trên GitHub chưa?" -ForegroundColor White
    Write-Host "   - Username/Token đúng chưa?" -ForegroundColor White
    Write-Host "   - Internet kết nối ổn định?" -ForegroundColor White
}

Write-Host ""
Read-Host "Nhấn Enter để đóng"
