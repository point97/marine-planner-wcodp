# Create your views here.
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext
from data_manager.models import *
from utils import get_domain
import os
import settings

