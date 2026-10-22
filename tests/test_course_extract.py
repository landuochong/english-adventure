import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from course_extract import validate_input,normalize
class ExtractionTests(unittest.TestCase):
 def result(self):return dict(image_text='',warnings=[],vocabulary=[],phrases=[],grammar=[])
 def test_empty_and_invalid_images_rejected(self):
  for data in [{},{'text':'x','images':['not-base64']},{'text':'x'*20001}]:
   with self.assertRaises(ValueError):validate_input(data)
 def test_invented_evidence_marked_for_review(self):
  d=self.result();d['vocabulary']=[dict(term='apple',meaning='苹果',evidence='I have an apple.',origin='lesson')]
  self.assertEqual(normalize(d,'I would like water.','')['vocabulary'][0]['origin'],'review')
 def test_supplement_source_separate(self):
  d=self.result();d['grammar']=[dict(term='could 请求',meaning='委婉请求',evidence='Could I have water?',origin='supplement')]
  self.assertEqual(normalize(d,'hello','Could I have water?')['grammar'][0]['origin'],'supplement')
 def test_single_word_phrase_requires_review(self):
  d=self.result();d['phrases']=[dict(term='without',meaning='不加',evidence='without onions',origin='lesson')]
  self.assertEqual(normalize(d,'without onions','')['phrases'][0]['origin'],'review')
 def test_empty_result_rejected(self):
  with self.assertRaises(ValueError):normalize(self.result(),'hello','')
if __name__=='__main__':unittest.main()
