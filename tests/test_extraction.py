import unittest
from tools.export_browser_history import ReadableTextParser, json_ld_article_body
class ExtractionTests(unittest.TestCase):
    def test_unicode_json_ld(self):
        self.assertEqual(json_ld_article_body('{"articleBody":"記憶與印象。\\n第二段內容"}', 1000), "記憶與印象。\n第二段內容")
    def test_void_tags_do_not_poison_parent(self):
        text = "Useful content about memory and learning. " * 8
        parser = ReadableTextParser("main")
        parser.feed('<main><img class="sidebar"><meta name="test"><p>' + text + '</p></main>')
        self.assertIn("Useful content", parser.text(1000))
    def test_remove_noise(self):
        parser = ReadableTextParser("main")
        parser.feed('<main><nav>SECRET MENU</nav><script>SECRET SCRIPT</script><p>' + "文章正文與記憶練習。" * 20 + '</p></main>')
        result = parser.text(2000)
        self.assertIn("文章正文",result)
        self.assertNotIn("SECRET",result)
    def test_self_closing_script(self):
        parser = ReadableTextParser("main")
        parser.feed('<main><script/><p>' + "Actual content. " * 20 + '</p></main>')
        self.assertIn("Actual content",parser.text(1000))
if __name__ == "__main__":
    unittest.main()
