param([string]$OutputPath = (Join-Path $PSScriptRoot '../public/data/medical-catalog.json'))
$ErrorActionPreference = 'Stop'
$indexUrl = 'https://medlineplus.gov/xml.html'
$page = Invoke-WebRequest $indexUrl -UseBasicParsing
$links = [regex]::Matches($page.Content, 'href="(https://medlineplus\.gov/xml/mplus_topics_(\d{4}-\d{2}-\d{2})\.xml)"')
if ($links.Count -eq 0) { throw 'Official health topic XML link not found.' }
$latest = $links | Sort-Object { $_.Groups[2].Value } -Descending | Select-Object -First 1
$downloadUrl = $latest.Groups[1].Value
$tempPath = [System.IO.Path]::GetTempFileName()
try {
  Invoke-WebRequest $downloadUrl -OutFile $tempPath -UseBasicParsing
  $settings = [System.Xml.XmlReaderSettings]::new()
  $settings.DtdProcessing = [System.Xml.DtdProcessing]::Ignore
  $settings.XmlResolver = $null
  $settings.MaxCharactersInDocument = 100000000
  $reader = [System.Xml.XmlReader]::Create($tempPath, $settings)
  $xml = [System.Xml.XmlDocument]::new()
  $xml.XmlResolver = $null
  try { $xml.Load($reader) } finally { $reader.Dispose() }
  function PlainText([string]$text) {
    $text = [regex]::Replace($text, '(?is)<(script|style)\b[^>]*>.*?</\1>', '')
    $text = [regex]::Replace($text, '(?i)</?(p|h[1-6]|li|tr|td|th|br)\b[^>]*>', ' ')
    $text = [regex]::Replace($text, '<[^>]*>', '')
    $text = [System.Net.WebUtility]::HtmlDecode($text)
    # Remove any residual angle-bracket markup after decoding; stored as text only.
    $text = [regex]::Replace($text, '<[^>]*>', '')
    return ([regex]::Replace($text, '\s+', ' ')).Trim()
  }
  function SafeHttps([string]$text) {
    $uri = $null
    return [Uri]::TryCreate($text, [UriKind]::Absolute, [ref]$uri) -and $uri.Scheme -eq 'https' -and [string]::IsNullOrEmpty($uri.UserInfo)
  }
  $topics = @($xml.SelectNodes('/health-topics/health-topic[@language="English"]') | ForEach-Object {
    $topic = $_
    if (-not (SafeHttps $topic.GetAttribute('url'))) { throw 'Non-HTTPS topic source.' }
    $sections = [ordered]@{ treatment = @(); diagnosis = @(); outcomes = @() }
    foreach ($site in $topic.SelectNodes('site')) {
      if (-not (SafeHttps $site.GetAttribute('url'))) { continue }
      foreach ($categoryNode in $site.SelectNodes('information-category')) {
        $category = $categoryNode.InnerText
        $kind = $null
        if ($category -eq 'Treatments and Therapies') { $kind = 'treatment' }
        elseif ($category -eq 'Diagnosis and Tests') { $kind = 'diagnosis' }
        $kinds = @()
        if ($kind) { $kinds += $kind }
        if ($category -match '(?i)prognos|outcome|complication' -or $site.GetAttribute('title') -match '(?i)\b(prognosis|outcomes?|complications?)\b') { $kinds += 'outcomes' }
        foreach ($kind in $kinds) {
          $entry = [ordered]@{title = (PlainText $site.GetAttribute('title')); url = $site.GetAttribute('url'); organization = (PlainText $site.SelectSingleNode('organization').InnerText); category = $category}
          if (-not ($sections[$kind] | Where-Object { $_.url -eq $entry.url })) { $sections[$kind] += $entry }
        }
      }
    }
    [ordered]@{
      id = $topic.GetAttribute('id'); title = $topic.GetAttribute('title'); url = $topic.GetAttribute('url')
      aliases = @($topic.SelectNodes('also-called|see-reference') | ForEach-Object { PlainText $_.InnerText } | Sort-Object -Unique)
      groups = @($topic.SelectNodes('group') | ForEach-Object { $_.InnerText } | Sort-Object -Unique)
      summaryPlainText = PlainText $topic.SelectSingleNode('full-summary').InnerText
      sections = $sections
    }
  })
  if ($topics.Count -lt 500) { throw 'Unexpectedly small catalog; retaining existing output.' }
  $catalog = [ordered]@{
    schemaVersion = 1
    metadata = [ordered]@{
      source = 'MedlinePlus, National Library of Medicine'; sourceUrl = $indexUrl; downloadUrl = $downloadUrl
      fetchedAt = [DateTime]::UtcNow.ToString('o'); sourceDate = $latest.Groups[2].Value; language = 'en'; topicCount = $topics.Count
      scope = 'MedlinePlus English health topics, including diseases, tests, and wellness; not every known disease.'
      attribution = 'Source: MedlinePlus, National Library of Medicine.'
      contentPolicyUrl = 'https://medlineplus.gov/about/using/usingcontent/'
      sectionPolicy = 'Treatment and diagnosis links use original XML categories. Outcomes links use source category or title mentioning prognosis, outcomes or complications; no outcome probabilities are inferred. External articles are linked only, not ingested.'
    }
    topics = $topics
  }
  $outputFullPath = [System.IO.Path]::GetFullPath($OutputPath)
  [System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($outputFullPath)) | Out-Null
  [System.IO.File]::WriteAllText($outputFullPath, ($catalog | ConvertTo-Json -Depth 12 -Compress), [System.Text.UTF8Encoding]::new($false))
  Write-Output "Imported $($topics.Count) English health topics from $downloadUrl"
} finally { Remove-Item -LiteralPath $tempPath -Force }