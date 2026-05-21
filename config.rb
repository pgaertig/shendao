# Activate and configure extensions
# https://middlemanapp.com/advanced/configuration/#configuring-extensions

activate :autoprefixer do |prefix|
  prefix.browsers = "last 2 versions"
end

# Layouts
# https://middlemanapp.com/basics/layouts/

# Per-page layout changes
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

page "/index.html", layout: "root"
page "/blog/*", layout: "blog"

set :css_dir, 'css'
set :js_dir, 'js'
set :images_dir, 'img'
set :host, "https://shendao.poznan.pl"
set :strip_index_file, true
#set :relative_links, true

# With alternative layout
# page '/path/to/file.html', layout: 'other_layout'

# Proxy pages
# https://middlemanapp.com/advanced/dynamic-pages/

# proxy(
#   '/this-page-has-no-template.html',
#   '/template-file.html',
#   locals: {
#     which_fake_page: 'Rendering a fake page with a local variable'
#   },
# )

# Helpers
# Methods defined in the helpers block are available in templates
# https://middlemanapp.com/basics/helper-methods/

# helpers do
#   def some_helper
#     'Helping'
#   end
# end

# Build-specific configuration
# https://middlemanapp.com/advanced/configuration/#environment-specific-settings

configure :build do
  activate :minify_css
  # Content-hash asset filenames (style2026-abc123.css) and rewrite every
  # reference — automatic cache-busting, no manual query string.
  # Excluded: simple-lightbox.* (loaded via a JS string) and shendao-icon256.png
  # (referenced by absolute URLs in og:image / JSON-LD) — asset_hash can rewrite
  # neither, so those keep stable names.
  activate :asset_hash,
    exts: %w(.css .js .png .jpg .jpeg .gif .svg .webp),
    ignore: [%r{simple-lightbox}, %r{shendao-icon256}]
  activate :gzip
#   activate :minify_javascript, compressor: Terser.new
end
