# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'RDFConcept.slug'
        db.add_column(u'ontology_rdfconcept', 'slug',
                      self.gf('django.db.models.fields.SlugField')(default='', max_length=125),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'RDFConcept.slug'
        db.delete_column(u'ontology_rdfconcept', 'slug')


    models = {
        u'ontology.rdfconcept': {
            'Meta': {'object_name': 'RDFConcept'},
            'definition': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            u'level': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            u'lft': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'parent': ('mptt.fields.TreeForeignKey', [], {'blank': 'True', 'related_name': "'children'", 'null': 'True', 'to': u"orm['ontology.RDFConcept']"}),
            'preflabel': ('django.db.models.fields.CharField', [], {'max_length': '125'}),
            u'rght': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'default': "''", 'max_length': '125'}),
            u'tree_id': ('django.db.models.fields.PositiveIntegerField', [], {'db_index': 'True'}),
            'uri': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        u'ontology.term': {
            'Meta': {'object_name': 'Term'},
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '125'}),
            'parents': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'parents_rel_+'", 'null': 'True', 'to': u"orm['ontology.Term']"}),
            'slug': ('django.db.models.fields.CharField', [], {'max_length': '125'})
        }
    }

    complete_apps = ['ontology']