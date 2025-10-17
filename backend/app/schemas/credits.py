"""
Credits purchase schemas
"""
from pydantic import BaseModel


class CreditsPurchaseRequest(BaseModel):
    """Schema for credits purchase request"""
    package: str = "1000_credits"  # Package identifier
    payment_method: str = "demo"   # Payment method (demo, stripe, paypal, etc.)


class CreditsPurchaseResponse(BaseModel):
    """Schema for credits purchase response"""
    success: bool
    new_balance: float
    transaction_id: str
    message: str


class CreditsPackageInfo(BaseModel):
    """Schema for credits package information"""
    package_id: str
    credits: int
    price: float
    currency: str = "USD"
    description: str
