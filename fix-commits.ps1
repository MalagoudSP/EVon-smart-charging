# Script to change all v0[bot] commits to your name
$env:FILTER_BRANCH_SQUELCH_WARNING = 1

# Set git configuration temporarily
git config user.name "Malagoud Patil"
git config user.email "malagoudspatil2005@gmail.com"

# Run filter-branch using a helper environment variable script
$filterScript = {
    if ($env:GIT_AUTHOR_NAME -eq "v0") {
        $env:GIT_AUTHOR_NAME = "Malagoud Patil"
        $env:GIT_AUTHOR_EMAIL = "malagoudspatil2005@gmail.com"
    }
    if ($env:GIT_COMMITTER_NAME -eq "v0") {
        $env:GIT_COMMITTER_NAME = "Malagoud Patil"
        $env:GIT_COMMITTER_EMAIL = "malagoudspatil2005@gmail.com"
    }
}.ToString()

Write-Host "Rewriting git history to change v0[bot] commits to your name..."
Write-Host "This may take a moment..."

# Use git filter-branch with the env-filter
Invoke-Expression @"
git filter-branch --env-filter `
'if [ `"`$GIT_COMMITTER_NAME`" = "v0" ]; then `
export GIT_COMMITTER_NAME="Malagoud Patil"; `
export GIT_COMMITTER_EMAIL="malagoudspatil2005@gmail.com"; `
fi; `
if [ `"`$GIT_AUTHOR_NAME`" = "v0" ]; then `
export GIT_AUTHOR_NAME="Malagoud Patil"; `
export GIT_AUTHOR_EMAIL="malagoudspatil2005@gmail.com"; `
fi' -f -- --all
"@

Write-Host "Done! All v0[bot] commits have been changed to your name."
Write-Host ""
Write-Host "To push these changes to GitHub, run:"
Write-Host "  git push --force-with-lease"
